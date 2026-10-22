import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { CustomIcon } from './CustomIcon';

export interface PrecisionDateTimePickerProps {
  visible: boolean;
  title: string;
  initialDate: Date;
  onConfirm: (date: Date) => void;
  onCancel?: () => void;
  onClose?: () => void;
  minDate?: Date;
  accentColor?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const PrecisionDateTimePicker: React.FC<PrecisionDateTimePickerProps> = ({
  visible,
  title,
  initialDate,
  onConfirm,
  onCancel,
  onClose,
  minDate,
  accentColor = Colors.primary,
}) => {
  const handleDismiss = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };
  // Working date state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate));
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Time components
  const [hour12, setHour12] = useState<number>(() => {
    const h = initialDate.getHours();
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  });
  const [minute, setMinute] = useState<number>(initialDate.getMinutes());
  const [isPM, setIsPM] = useState<boolean>(initialDate.getHours() >= 12);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');

  useEffect(() => {
    if (visible) {
      const d = new Date(initialDate);
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      const h = d.getHours();
      setHour12(h === 0 ? 12 : h > 12 ? h - 12 : h);
      setMinute(d.getMinutes());
      setIsPM(h >= 12);
      setActiveTab('date');
    }
  }, [visible, initialDate]);

  // Sync selectedDate hours and minutes when time states change
  const updateWorkingDateTime = (newH12: number, newMin: number, newIsPM: boolean) => {
    let militaryHours = newH12;
    if (newIsPM) {
      if (militaryHours < 12) militaryHours += 12;
    } else {
      if (militaryHours === 12) militaryHours = 0;
    }

    const updated = new Date(selectedDate);
    updated.setHours(militaryHours, newMin, 0, 0);
    setSelectedDate(updated);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar days generator
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const handleDaySelect = (day: number) => {
    let militaryHours = hour12;
    if (isPM) {
      if (militaryHours < 12) militaryHours += 12;
    } else {
      if (militaryHours === 12) militaryHours = 0;
    }

    const newDate = new Date(viewYear, viewMonth, day, militaryHours, minute, 0, 0);
    setSelectedDate(newDate);
  };

  // Quick Date presets
  const applyDatePreset = (preset: 'today' | 'tomorrow' | 'in3days' | 'nextWeek') => {
    const d = new Date();
    if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (preset === 'in3days') {
      d.setDate(d.getDate() + 3);
    } else if (preset === 'nextWeek') {
      d.setDate(d.getDate() + 7);
    }
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());

    let militaryHours = hour12;
    if (isPM) {
      if (militaryHours < 12) militaryHours += 12;
    } else {
      if (militaryHours === 12) militaryHours = 0;
    }
    d.setHours(militaryHours, minute, 0, 0);
    setSelectedDate(d);
  };

  // Time adjustments
  const adjustHour = (delta: number) => {
    let next = hour12 + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    setHour12(next);
    updateWorkingDateTime(next, minute, isPM);
  };

  const adjustMinute = (delta: number) => {
    let next = minute + delta;
    if (next >= 60) {
      next = next % 60;
      adjustHour(1);
    } else if (next < 0) {
      next = 60 + (next % 60);
      adjustHour(-1);
    }
    setMinute(next);
    updateWorkingDateTime(hour12, next, isPM);
  };

  const toggleAMPM = () => {
    const nextIsPM = !isPM;
    setIsPM(nextIsPM);
    updateWorkingDateTime(hour12, minute, nextIsPM);
  };

  const applyTimePreset = (h: number, m: number, pm: boolean) => {
    setHour12(h);
    setMinute(m);
    setIsPM(pm);
    updateWorkingDateTime(h, m, pm);
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  const formattedDateTimePreview = () => {
    const d = selectedDate;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const yearNum = d.getFullYear();
    const mStr = minute.toString().padStart(2, '0');
    const hStr = hour12.toString().padStart(2, '0');
    const ampmStr = isPM ? 'PM' : 'AM';
    return `${dayName}, ${monthName} ${dayNum}, ${yearNum} • ${hStr}:${mStr} ${ampmStr}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.titleIconBadge}>
                <CustomIcon
                  name={activeTab === 'date' ? 'calendar' : 'clock'}
                  size={16}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.modalTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <CustomIcon name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Live Preview Banner */}
          <View style={styles.previewBanner}>
            <CustomIcon name="clock" size={14} color={Colors.primary} />
            <Text style={styles.previewText} numberOfLines={1}>
              {formattedDateTimePreview()}
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'date' && styles.tabButtonActive]}
              onPress={() => setActiveTab('date')}
              activeOpacity={0.8}
            >
              <CustomIcon
                name="calendar"
                size={14}
                color={activeTab === 'date' ? Colors.white : Colors.textMuted}
              />
              <Text
                style={[styles.tabText, activeTab === 'date' && styles.tabTextActive]}
              >
                1. Select Date
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'time' && styles.tabButtonActive]}
              onPress={() => setActiveTab('time')}
              activeOpacity={0.8}
            >
              <CustomIcon
                name="clock"
                size={14}
                color={activeTab === 'time' ? Colors.white : Colors.textMuted}
              />
              <Text
                style={[styles.tabText, activeTab === 'time' && styles.tabTextActive]}
              >
                2. Set Time ({hour12}:{minute.toString().padStart(2, '0')} {isPM ? 'PM' : 'AM'})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'date' ? (
              <View style={styles.dateTabContent}>
                {/* Month Navigator */}
                <View style={styles.monthNavigator}>
                  <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={styles.navArrow}
                    activeOpacity={0.7}
                  >
                    <CustomIcon name="chevron-left" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>

                  <Text style={styles.monthYearTitle}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </Text>

                  <TouchableOpacity
                    onPress={handleNextMonth}
                    style={styles.navArrow}
                    activeOpacity={0.7}
                  >
                    <CustomIcon name="chevron-right" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Day Names Header */}
                <View style={styles.daysHeader}>
                  {DAYS_OF_WEEK.map((d, i) => (
                    <Text key={i} style={styles.dayOfWeekText}>
                      {d}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDay }).map((_, idx) => (
                    <View key={`empty-${idx}`} style={styles.dayCellEmpty} />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isSelected =
                      selectedDate.getFullYear() === viewYear &&
                      selectedDate.getMonth() === viewMonth &&
                      selectedDate.getDate() === dayNum;

                    const today = new Date();
                    const isToday =
                      today.getFullYear() === viewYear &&
                      today.getMonth() === viewMonth &&
                      today.getDate() === dayNum;

                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          isToday && !isSelected && styles.dayCellToday,
                        ]}
                        onPress={() => handleDaySelect(dayNum)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            isSelected && styles.dayCellTextSelected,
                            isToday && !isSelected && styles.dayCellTextToday,
                          ]}
                        >
                          {dayNum}
                        </Text>
                        {isToday && !isSelected && <View style={styles.todayDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Quick Date Chips */}
                <View style={styles.quickChipsContainer}>
                  <Text style={styles.sectionSubtitle}>Quick Presets:</Text>
                  <View style={styles.chipsRow}>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => applyDatePreset('today')}
                    >
                      <Text style={styles.quickChipText}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => applyDatePreset('tomorrow')}
                    >
                      <Text style={styles.quickChipText}>Tomorrow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => applyDatePreset('in3days')}
                    >
                      <Text style={styles.quickChipText}>In 3 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => applyDatePreset('nextWeek')}
                    >
                      <Text style={styles.quickChipText}>Next Week</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.timeTabContent}>
                {/* Precision Digital Clock Display */}
                <View style={styles.clockContainer}>
                  {/* Hours */}
                  <View style={styles.timeUnitBlock}>
                    <TouchableOpacity
                      style={styles.timeStepper}
                      onPress={() => adjustHour(1)}
                    >
                      <CustomIcon name="chevron-up" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.digitBox}>
                      <Text style={styles.digitText}>
                        {hour12.toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timeStepper}
                      onPress={() => adjustHour(-1)}
                    >
                      <CustomIcon name="chevron-down" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.unitLabel}>HOUR</Text>
                  </View>

                  <Text style={styles.colonSeparator}>:</Text>

                  {/* Minutes */}
                  <View style={styles.timeUnitBlock}>
                    <TouchableOpacity
                      style={styles.timeStepper}
                      onPress={() => adjustMinute(5)}
                    >
                      <CustomIcon name="chevron-up" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.digitBox}>
                      <Text style={styles.digitText}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timeStepper}
                      onPress={() => adjustMinute(-5)}
                    >
                      <CustomIcon name="chevron-down" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.unitLabel}>MINUTE</Text>
                  </View>

                  {/* AM / PM Toggle */}
                  <View style={styles.ampmContainer}>
                    <TouchableOpacity
                      style={[styles.ampmButton, !isPM && styles.ampmButtonActive]}
                      onPress={() => {
                        if (isPM) toggleAMPM();
                      }}
                    >
                      <Text
                        style={[styles.ampmText, !isPM && styles.ampmTextActive]}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.ampmButton, isPM && styles.ampmButtonActive]}
                      onPress={() => {
                        if (!isPM) toggleAMPM();
                      }}
                    >
                      <Text
                        style={[styles.ampmText, isPM && styles.ampmTextActive]}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Minute Fast Tweakers */}
                <View style={styles.minuteTweakers}>
                  <Text style={styles.sectionSubtitle}>Quick Adjust Minutes:</Text>
                  <View style={styles.chipsRow}>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => adjustMinute(-15)}
                    >
                      <Text style={styles.quickChipText}>-15m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => adjustMinute(15)}
                    >
                      <Text style={styles.quickChipText}>+15m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => adjustMinute(30)}
                    >
                      <Text style={styles.quickChipText}>+30m</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => {
                        setMinute(0);
                        updateWorkingDateTime(hour12, 0, isPM);
                      }}
                    >
                      <Text style={styles.quickChipText}>:00</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickChip}
                      onPress={() => {
                        setMinute(30);
                        updateWorkingDateTime(hour12, 30, isPM);
                      }}
                    >
                      <Text style={styles.quickChipText}>:30</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Common Schedule Presets */}
                <View style={styles.schedulePresets}>
                  <Text style={styles.sectionSubtitle}>Standard Times:</Text>
                  <View style={styles.presetsGrid}>
                    <TouchableOpacity
                      style={styles.presetCard}
                      onPress={() => applyTimePreset(9, 0, false)}
                    >
                      <Text style={styles.presetTime}>09:00 AM</Text>
                      <Text style={styles.presetLabel}>Morning Start</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.presetCard}
                      onPress={() => applyTimePreset(1, 0, true)}
                    >
                      <Text style={styles.presetTime}>01:00 PM</Text>
                      <Text style={styles.presetLabel}>Post Lunch</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.presetCard}
                      onPress={() => applyTimePreset(6, 0, true)}
                    >
                      <Text style={styles.presetTime}>06:00 PM</Text>
                      <Text style={styles.presetLabel}>Evening Wrap</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.presetCard}
                      onPress={() => applyTimePreset(11, 59, true)}
                    >
                      <Text style={styles.presetTime}>11:59 PM</Text>
                      <Text style={styles.presetLabel}>End of Day</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <CustomIcon name="check" size={16} color={Colors.white} />
              <Text style={styles.confirmButtonText}>Set Exact Date & Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  previewText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  contentScroll: {
    maxHeight: 380,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTabContent: {
    paddingBottom: 8,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayOfWeekText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 40,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  dayCellText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dayCellTextSelected: {
    color: Colors.white,
    fontWeight: '800',
  },
  dayCellTextToday: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    bottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickChipsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timeTabContent: {
    paddingVertical: 8,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  timeUnitBlock: {
    alignItems: 'center',
  },
  timeStepper: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    marginVertical: 4,
  },
  digitBox: {
    backgroundColor: Colors.bgSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    minWidth: 70,
    alignItems: 'center',
  },
  digitText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  colonSeparator: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginHorizontal: 10,
    marginBottom: 16,
  },
  ampmContainer: {
    marginLeft: 16,
    gap: 6,
  },
  ampmButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ampmButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  ampmText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  ampmTextActive: {
    color: Colors.white,
  },
  minuteTweakers: {
    marginTop: 16,
  },
  schedulePresets: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  presetLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '700',
  },
});
