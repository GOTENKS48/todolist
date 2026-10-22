import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Share,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logoutUser, updateUserProfile } from '../redux/slices/authSlice';
import {
  fetchTasks,
  fetchStats,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  setFilterStatus,
  setSelectedCategory,
  setSortBy,
  setSearchQuery,
} from '../redux/slices/taskSlice';
import { Task, DeadlineNotification, SortOption, FilterStatus, TaskCategory } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { ProfileModal } from '../components/ProfileModal';
import { NotificationBanner } from '../components/NotificationBanner';
import { NotificationCenterModal } from '../components/NotificationCenterModal';
import { CustomIcon } from '../components/CustomIcon';
import { notificationService } from '../services/notificationService';

const SORT_OPTIONS: { id: SortOption; label: string; icon: string; description: string }[] = [
  { id: 'smartScore', label: 'Smart Score', icon: '⚡', description: 'Urgency & priority algorithm' },
  { id: 'deadline', label: 'Target Deadline', icon: '⏰', description: 'Earliest deadline first' },
  { id: 'priority', label: 'Priority', icon: '🚨', description: 'Urgent to Low' },
  { id: 'dateTime', label: 'Scheduled Date', icon: '📅', description: 'Calendar order' },
  { id: 'createdAt', label: 'Recently Created', icon: '✨', description: 'Newest tasks first' },
];

const CATEGORIES: { id: TaskCategory | 'ALL'; label: string; icon: string }[] = [
  { id: 'ALL', label: 'All Categories', icon: '📁' },
  { id: 'WORK', label: 'Work', icon: '💼' },
  { id: 'PERSONAL', label: 'Personal', icon: '👤' },
  { id: 'URGENT', label: 'Urgent', icon: '🔥' },
  { id: 'HEALTH', label: 'Health', icon: '❤️' },
  { id: 'FINANCE', label: 'Finance', icon: '💳' },
  { id: 'STUDY', label: 'Study', icon: '📚' },
  { id: 'OTHER', label: 'Other', icon: '📌' },
];

export const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    tasks,
    stats,
    filterStatus,
    selectedCategory,
    sortBy,
    searchQuery,
    isLoading,
    isRefreshing,
  } = useAppSelector((state) => state.tasks);

  // Modals state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Title state (editable or customizable, defaults to "weekend to-do list")
  const [listTitle, setListTitle] = useState('weekend to-do list');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Notifications state
  const [activeNotifications, setActiveNotifications] = useState<DeadlineNotification[]>([]);
  const [bannerNotification, setBannerNotification] = useState<DeadlineNotification | null>(null);
  const [isNotificationCenterVisible, setIsNotificationCenterVisible] = useState(false);

  // Load tasks & stats on mount
  const loadData = useCallback(
    (refresh = false) => {
      dispatch(
        fetchTasks({
          status: filterStatus === 'ALL' ? 'all' : filterStatus.toLowerCase(),
          category: selectedCategory,
          search: searchQuery,
          sortBy,
          isRefresh: refresh,
        })
      );
      dispatch(fetchStats());
    },
    [dispatch, filterStatus, selectedCategory, searchQuery, sortBy]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to real-time deadline push alerts
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notif) => {
      setBannerNotification(notif);
      setActiveNotifications(notificationService.getActiveNotifications());
    });

    return () => unsubscribe();
  }, []);

  // Monitor deadlines whenever tasks change or every 60 seconds
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    // Check deadlines and schedule OS background alarms
    notificationService.checkDeadlines(tasks);
    setActiveNotifications(notificationService.getActiveNotifications());

    const interval = setInterval(() => {
      notificationService.checkDeadlines(tasks);
      setActiveNotifications(notificationService.getActiveNotifications());
    }, 60000);

    return () => clearInterval(interval);
  }, [tasks, user]);

  // Client-side filtering & search for instantaneous reactivity
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (filterStatus === 'PENDING' && task.isCompleted) return false;
      if (filterStatus === 'COMPLETED' && !task.isCompleted) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && task.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [tasks, filterStatus, selectedCategory, searchQuery]);

  // Handlers
  const handleToggle = (id: string) => {
    const target = tasks.find((t) => t._id === id);
    if (target && !target.isCompleted) {
      // Cancel background alarms when completed
      notificationService.cancelForTask(id);
    }
    dispatch(toggleTaskCompletion(id));
  };

  const handleDelete = (id: string) => {
    notificationService.cancelForTask(id);
    dispatch(deleteTask(id));
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleSelectTaskFromNotif = (taskId: string) => {
    const target = tasks.find((t) => t._id === taskId);
    if (target) {
      setEditingTask(target);
      setIsModalVisible(true);
    }
  };

  const handleModalSubmit = async (taskData: {
    title: string;
    description: string;
    dateTime: string;
    deadline: string;
    priority: any;
    category: any;
  }) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await dispatch(
          updateTask({
            id: editingTask._id,
            payload: taskData,
          })
        ).unwrap();
      } else {
        await dispatch(createTask(taskData)).unwrap();
      }
      setIsModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (profileData: {
    name: string;
    avatar?: string;
    bio?: string;
  }) => {
    setIsProfileUpdating(true);
    try {
      await dispatch(updateUserProfile(profileData)).unwrap();
    } finally {
      setIsProfileUpdating(false);
    }
  };

  const handleLogout = () => {
    setIsOptionsMenuVisible(false);
    dispatch(logoutUser());
  };

  const handleCycleFilterStatus = () => {
    const nextStatus: Record<FilterStatus, FilterStatus> = {
      ALL: 'PENDING',
      PENDING: 'COMPLETED',
      COMPLETED: 'ALL',
    };
    dispatch(setFilterStatus(nextStatus[filterStatus]));
  };

  const handleShareList = async () => {
    try {
      const activeText = filteredTasks
        .map((t) => `${t.isCompleted ? '✓' : '○'} ${t.title}`)
        .join('\n');
      await Share.share({
        title: listTitle,
        message: `${listTitle.toUpperCase()}\n\n${activeText || 'No tasks yet!'}\n\nShared via TaskOrbit`,
      });
    } catch {
      // Ignore share cancellation
    }
  };

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Smart Score';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Decorative Organic Wavy Shapes from Reference Image */}
      <View style={styles.backgroundDecorativeContainer} pointerEvents="none">
        <View style={styles.wavePeriwinkleTopRight} />
        <View style={styles.waveButterCreamTopLeft} />
        <View style={styles.wavePeriwinkleBottomLeft} />
        <View style={styles.waveButterCreamBottomRight} />
      </View>

      {/* Floating Push Notification Banner */}
      <NotificationBanner
        notification={bannerNotification}
        onDismiss={() => setBannerNotification(null)}
        onPressTask={handleSelectTaskFromNotif}
      />

      {/* Central Apple Notes Card exactly like the reference image */}
      <View style={styles.centerCardContainer}>
        {/* Card Header Bar: Breadcrumb on left, Share & Options on right */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.breadcrumbBtn}
            onPress={() => setIsProfileModalVisible(true)}
            activeOpacity={0.7}
          >
            <CustomIcon name="chevron-left" size={16} color="#C59158" />
            <Text style={styles.breadcrumbText}>
              {user?.name ? user.name.split(' ')[0] : 'TaskOrbit'}
            </Text>
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
            {/* Notification Bell with Badge */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => setIsNotificationCenterVisible(true)}
              activeOpacity={0.7}
            >
              <CustomIcon name="bell" size={16} color="#C59158" />
              {activeNotifications.length > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{activeNotifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={handleShareList}
              activeOpacity={0.7}
            >
              <CustomIcon name="share" size={16} color="#C59158" />
            </TouchableOpacity>

            {/* Options Button (...) */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => setIsOptionsMenuVisible(true)}
              activeOpacity={0.7}
            >
              <CustomIcon name="more-horizontal" size={18} color="#C59158" />
            </TouchableOpacity>
          </View>
        </View>

        {/* List Title: "weekend to-do list" */}
        <View style={styles.titleContainer}>
          {isEditingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={listTitle}
              onChangeText={setListTitle}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingTitle(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.titleText}>{listTitle}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Clean "Sorted by" Button (as explicitly requested: dont remove sorting but make another button to show sorted by cleanly) */}
        <View style={styles.sortBarWrapper}>
          <TouchableOpacity
            style={styles.cleanSortBtn}
            onPress={() => setIsSortModalVisible(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.cleanSortIcon}>⇅</Text>
            <Text style={styles.cleanSortLabel}>Sorted by:</Text>
            <Text style={styles.cleanSortValue}>{currentSortLabel}</Text>
            <Text style={styles.cleanSortChevron}>▾</Text>
          </TouchableOpacity>

          {/* Active Filter Status Badge if not ALL */}
          {filterStatus !== 'ALL' && (
            <TouchableOpacity
              style={styles.activeFilterPill}
              onPress={handleCycleFilterStatus}
            >
              <Text style={styles.activeFilterPillText}>
                {filterStatus === 'PENDING' ? '⏳ Pending' : '✓ Completed'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Active Category Badge if not ALL */}
          {selectedCategory !== 'ALL' && (
            <TouchableOpacity
              style={styles.activeCategoryPill}
              onPress={() => setIsCategoryModalVisible(true)}
            >
              <Text style={styles.activeCategoryPillText}>{selectedCategory}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Inline Search Bar (toggled via bottom search icon) */}
        {isSearchActive && (
          <View style={styles.inlineSearchRow}>
            <CustomIcon name="search" size={14} color="#C59158" />
            <TextInput
              style={styles.inlineSearchInput}
              placeholder="Search tasks..."
              placeholderTextColor="#A89B8C"
              value={searchQuery}
              onChangeText={(text) => dispatch(setSearchQuery(text))}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => dispatch(setSearchQuery(''))}>
                <CustomIcon name="close" size={14} color="#A89B8C" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Main Tasks List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(true)}
              tintColor="#C59158"
              colors={['#C59158']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>Nothing on the list yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the pencil icon below to write your first task.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={handleOpenCreate}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyAddBtnText}>+ Add a Task</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Pinned Bottom Toolbar (exactly matching reference image: Checklist, Camera/Search, Attachment/Category, Pencil/Add) */}
        <View style={styles.pinnedToolbar}>
          {/* 1. Checklist / Status Filter Toggle */}
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={handleCycleFilterStatus}
            activeOpacity={0.65}
            accessibilityLabel="Filter by status"
          >
            <CustomIcon
              name="check-circle"
              size={22}
              color={filterStatus !== 'ALL' ? '#C59158' : '#B89B7B'}
            />
            {filterStatus !== 'ALL' && <View style={styles.toolbarIndicatorDot} />}
          </TouchableOpacity>

          {/* 2. Search Toggle (matches camera/search slot in reference) */}
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => setIsSearchActive(!isSearchActive)}
            activeOpacity={0.65}
            accessibilityLabel="Search tasks"
          >
            <CustomIcon
              name="search"
              size={22}
              color={isSearchActive ? '#C59158' : '#B89B7B'}
            />
          </TouchableOpacity>

          {/* 3. Attachment / Category Filter (matches paperclip slot in reference) */}
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => setIsCategoryModalVisible(true)}
            activeOpacity={0.65}
            accessibilityLabel="Filter by category"
          >
            <CustomIcon
              name="tag"
              size={22}
              color={selectedCategory !== 'ALL' ? '#C59158' : '#B89B7B'}
            />
            {selectedCategory !== 'ALL' && <View style={styles.toolbarIndicatorDot} />}
          </TouchableOpacity>

          {/* 4. Pencil / New Task Composer (matches pencil slot in reference) */}
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={handleOpenCreate}
            activeOpacity={0.65}
            accessibilityLabel="Create new task"
          >
            <CustomIcon name="edit" size={23} color="#C59158" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Clean "Sorted By" Picker Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSortModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Sort Tasks By</Text>
                  <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
                    <CustomIcon name="close" size={16} color="#7A6E61" />
                  </TouchableOpacity>
                </View>

                {SORT_OPTIONS.map((opt) => {
                  const isSelected = sortBy === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.pickerOptionRow,
                        isSelected && styles.pickerOptionRowSelected,
                      ]}
                      onPress={() => {
                        dispatch(setSortBy(opt.id));
                        setIsSortModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerOptionIcon}>{opt.icon}</Text>
                      <View style={styles.pickerOptionTextWrap}>
                        <Text
                          style={[
                            styles.pickerOptionLabel,
                            isSelected && styles.pickerOptionLabelSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={styles.pickerOptionDesc}>{opt.description}</Text>
                      </View>
                      {isSelected && (
                        <CustomIcon name="check" size={16} color="#C59158" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Category Filter Picker Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsCategoryModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Filter by Category</Text>
                  <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                    <CustomIcon name="close" size={16} color="#7A6E61" />
                  </TouchableOpacity>
                </View>

                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.pickerOptionRow,
                        isSelected && styles.pickerOptionRowSelected,
                      ]}
                      onPress={() => {
                        dispatch(setSelectedCategory(cat.id));
                        setIsCategoryModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerOptionIcon}>{cat.icon}</Text>
                      <View style={styles.pickerOptionTextWrap}>
                        <Text
                          style={[
                            styles.pickerOptionLabel,
                            isSelected && styles.pickerOptionLabelSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </View>
                      {isSelected && (
                        <CustomIcon name="check" size={16} color="#C59158" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Options Menu Sheet (...) */}
      <Modal
        visible={isOptionsMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOptionsMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOptionsMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Options</Text>
                  <TouchableOpacity onPress={() => setIsOptionsMenuVisible(false)}>
                    <CustomIcon name="close" size={16} color="#7A6E61" />
                  </TouchableOpacity>
                </View>

                {/* Profile */}
                <TouchableOpacity
                  style={styles.pickerOptionRow}
                  onPress={() => {
                    setIsOptionsMenuVisible(false);
                    setIsProfileModalVisible(true);
                  }}
                >
                  <Text style={styles.pickerOptionIcon}>👤</Text>
                  <View style={styles.pickerOptionTextWrap}>
                    <Text style={styles.pickerOptionLabel}>My Profile & Account</Text>
                    <Text style={styles.pickerOptionDesc}>{user?.email}</Text>
                  </View>
                </TouchableOpacity>

                {/* Deadline Alerts */}
                <TouchableOpacity
                  style={styles.pickerOptionRow}
                  onPress={() => {
                    setIsOptionsMenuVisible(false);
                    setIsNotificationCenterVisible(true);
                  }}
                >
                  <Text style={styles.pickerOptionIcon}>🔔</Text>
                  <View style={styles.pickerOptionTextWrap}>
                    <Text style={styles.pickerOptionLabel}>Deadline Notification Center</Text>
                    <Text style={styles.pickerOptionDesc}>
                      {activeNotifications.length} active alerts
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Refresh */}
                <TouchableOpacity
                  style={styles.pickerOptionRow}
                  onPress={() => {
                    setIsOptionsMenuVisible(false);
                    loadData(true);
                  }}
                >
                  <Text style={styles.pickerOptionIcon}>🔄</Text>
                  <View style={styles.pickerOptionTextWrap}>
                    <Text style={styles.pickerOptionLabel}>Refresh Tasks & Stats</Text>
                  </View>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                  style={[styles.pickerOptionRow, { borderBottomWidth: 0 }]}
                  onPress={handleLogout}
                >
                  <Text style={styles.pickerOptionIcon}>🚪</Text>
                  <View style={styles.pickerOptionTextWrap}>
                    <Text style={[styles.pickerOptionLabel, { color: Colors.danger }]}>
                      Sign Out
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Create / Edit Task Modal */}
      <TaskModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        isLoading={isSubmitting}
      />

      {/* Edit Profile Modal */}
      <ProfileModal
        visible={isProfileModalVisible}
        user={user}
        onClose={() => setIsProfileModalVisible(false)}
        onSave={handleSaveProfile}
        isLoading={isProfileUpdating}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        visible={isNotificationCenterVisible}
        notifications={activeNotifications}
        onClose={() => setIsNotificationCenterVisible(false)}
        onClearAll={() => {
          notificationService.clearAll();
          setActiveNotifications([]);
          setBannerNotification(null);
        }}
        onSelectTask={handleSelectTaskFromNotif}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6ECE1',
  },
  // Abstract background shapes matching reference art
  backgroundDecorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  wavePeriwinkleTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 320,
    borderRadius: 100,
    backgroundColor: '#95ABC5',
    opacity: 0.75,
    transform: [{ rotate: '25deg' }],
  },
  waveButterCreamTopLeft: {
    position: 'absolute',
    top: -60,
    left: -50,
    width: 220,
    height: 240,
    borderRadius: 110,
    backgroundColor: '#F7E3C3',
    opacity: 0.9,
  },
  wavePeriwinkleBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 320,
    borderRadius: 120,
    backgroundColor: '#95ABC5',
    opacity: 0.7,
    transform: [{ rotate: '-20deg' }],
  },
  waveButterCreamBottomRight: {
    position: 'absolute',
    bottom: -40,
    right: -30,
    width: 180,
    height: 220,
    borderRadius: 90,
    backgroundColor: '#F5E2C4',
    opacity: 0.85,
  },
  // Central Apple Notes Paper Card
  centerCardContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    backgroundColor: '#FFFDF9',
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: '#ECE3D4',
    shadowColor: '#7A6146',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  breadcrumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C59158',
    letterSpacing: -0.2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleBtn: {
    padding: 4,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#D9534F',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2B2521',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2B2521',
    letterSpacing: -0.6,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C59158',
    paddingBottom: 2,
  },
  // Clean "Sorted by" button & active tags bar
  sortBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  cleanSortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: 'rgba(197, 145, 88, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 5,
  },
  cleanSortIcon: {
    fontSize: 12,
    color: '#C59158',
    fontWeight: '700',
  },
  cleanSortLabel: {
    fontSize: 12,
    color: '#8A7B6D',
    fontWeight: '500',
  },
  cleanSortValue: {
    fontSize: 12,
    color: '#C59158',
    fontWeight: '700',
  },
  cleanSortChevron: {
    fontSize: 10,
    color: '#C59158',
    marginLeft: 1,
  },
  activeFilterPill: {
    backgroundColor: '#F3E8D7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  activeFilterPillText: {
    fontSize: 11,
    color: '#7A5B36',
    fontWeight: '700',
  },
  activeCategoryPill: {
    backgroundColor: '#EBE3D6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  activeCategoryPillText: {
    fontSize: 11,
    color: '#6E5D4C',
    fontWeight: '700',
  },
  inlineSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#ECE3D4',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  inlineSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2B2521',
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2521',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A7B6D',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyAddBtn: {
    backgroundColor: '#C59158',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyAddBtnText: {
    color: '#FFFDF9',
    fontSize: 14,
    fontWeight: '700',
  },
  // Pinned Bottom Toolbar inside card (4 icons matching reference)
  pinnedToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#EDE3D4',
    backgroundColor: '#FFFDF9',
  },
  toolbarBtn: {
    padding: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarIndicatorDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C59158',
  },
  // Pickers & Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(35, 27, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: '75%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0D4C3',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5D7',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2521',
  },
  pickerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 145, 88, 0.1)',
  },
  pickerOptionRowSelected: {
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  pickerOptionIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  pickerOptionTextWrap: {
    flex: 1,
  },
  pickerOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2B2521',
  },
  pickerOptionLabelSelected: {
    color: '#C59158',
    fontWeight: '700',
  },
  pickerOptionDesc: {
    fontSize: 12,
    color: '#8A7B6D',
    marginTop: 2,
  },
});
