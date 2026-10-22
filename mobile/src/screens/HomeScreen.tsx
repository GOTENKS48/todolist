import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
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
import { Task, TaskCategory, FilterStatus, SortOption } from '../types';
import { Header } from '../components/Header';
import { StatsOverview } from '../components/StatsOverview';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilters } from '../components/CategoryFilters';
import { SortBar } from '../components/SortBar';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { EmptyState } from '../components/EmptyState';
import { CustomIcon } from '../components/CustomIcon';

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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tasks & stats on mount
  const loadData = useCallback(
    (refresh = false) => {
      dispatch(
        fetchTasks({
          status:
            filterStatus === 'ALL'
              ? 'all'
              : filterStatus.toLowerCase(),
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

  // Count active tasks per category for badge indicators
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      if (!t.isCompleted) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    return counts;
  }, [tasks]);

  // Handlers
  const handleToggle = (id: string) => {
    dispatch(toggleTaskCompletion(id));
  };

  const handleDelete = (id: string) => {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleResetFilters = () => {
    dispatch(setFilterStatus('ALL'));
    dispatch(setSelectedCategory('ALL'));
    dispatch(setSearchQuery(''));
  };

  const hasActiveFilters =
    filterStatus !== 'ALL' || selectedCategory !== 'ALL' || !!searchQuery.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary, Colors.secondary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header with user greeting & logout */}
            <Header user={user} stats={stats} onLogout={handleLogout} />

            {/* Performance Stats Overview */}
            <StatsOverview stats={stats} />

            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={(text) => dispatch(setSearchQuery(text))}
            />

            {/* Category Filter Pills */}
            <CategoryFilters
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => dispatch(setSelectedCategory(cat))}
              categoryCounts={categoryCounts}
            />

            {/* Status Tabs and Sort Bar */}
            <SortBar
              filterStatus={filterStatus}
              onChangeFilterStatus={(status) => dispatch(setFilterStatus(status))}
              sortBy={sortBy}
              onChangeSortBy={(sort) => dispatch(setSortBy(sort))}
              taskCount={filteredTasks.length}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleResetFilters}
            onAddTask={handleOpenCreate}
          />
        }
      />

      {/* Floating Action Button for Create Task */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenCreate}
        activeOpacity={0.85}
        accessibilityLabel="Create New Task"
      >
        <CustomIcon name="plus" size={24} color={Colors.white} />
      </TouchableOpacity>

      {/* Create / Edit Task Modal */}
      <TaskModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
