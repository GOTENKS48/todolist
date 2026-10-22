import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
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

  // Stepper Time components
  const [hour12, setHour12] = useState<number>(() => {
    const h = initialDate.getHours();
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  });
  const [minute, setMinute] = useState<number>(initialDate.getMinutes());
  const [isPM, setIsPM] = useState<boolean>(initialDate.getHours() >= 12);

  // Tabs: 'calendar' | 'time' | 'type'
  const [activeTab, setActiveTab] = useState<'calendar' | 'time' | 'type'>('type');

  // Direct Typable inputs
  const [typeYear, setTypeYear] = useState<string>('');
  const [typeMonth, setTypeMonth] = useState<string>('');
  const [typeDay, setTypeDay] = useState<string>('');
  const [typeHour, setTypeHour] = useState<string>('');
  const [typeMinute, setTypeMinute] = useState<string>('');
  const [typeIsPM, setTypeIsPM] = useState<boolean>(false);
  const [typeValidation, setTypeValidation] = useState<{
    isValid: boolean;
    message: string;
    parsedDate: Date | null;
  }>({ isValid: true, message: '', parsedDate: null });

  // Initialize and sync when opened
  useEffect(() => {
    if (visible) {
      const d = new Date(initialDate);
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());

      const h = d.getHours();
      const currentH12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const currentPM = h >= 12;

      setHour12(currentH12);
      setMinute(d.getMinutes());
      setIsPM(currentPM);

      // Populate typable input fields
      const yStr = d.getFullYear().toString();
      const mStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const dStr = d.getDate().toString().padStart(2, '0');
      const hStr = currentH12.toString();
      const minStr = d.getMinutes().toString().padStart(2, '0');

      setTypeYear(yStr);
      setTypeMonth(mStr);
      setTypeDay(dStr);
      setTypeHour(hStr);
      setTypeMinute(minStr);
      setTypeIsPM(currentPM);

      validateAndSetTyped(yStr, mStr, dStr, hStr, minStr, currentPM);
      setActiveTab('type');
    }
  }, [visible, initialDate]);

  // Validation function for eligible date and time
  const validateAndSetTyped = (
    yStr: string,
    mStr: string,
    dStr: string,
    hStr: string,
    minStr: string,
    pm: boolean
  ) => {
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    const h = parseInt(hStr, 10);
    const min = parseInt(minStr, 10);

    if (isNaN(y) || y < 2024 || y > 2040) {
      setTypeValidation({
        isValid: false,
        message: '⚠️ Year must be between 2024 and 2040',
        parsedDate: null,
      });
      return false;
    }

    if (isNaN(m) || m < 1 || m > 12) {
      setTypeValidation({
        isValid: false,
        message: '⚠️ Month must be between 01 and 12',
        parsedDate: null,
      });
      return false;
    }

    // Days in month validation (including leap year)
    const maxDays = new Date(y, m, 0).getDate();
    if (isNaN(d) || d < 1 || d > maxDays) {
      const monthName = MONTH_NAMES[m - 1] || 'This month';
      setTypeValidation({
        isValid: false,
        message: `⚠️ ${monthName} ${y} has only ${maxDays} days`,
        parsedDate: null,
      });
      return false;
    }

    if (isNaN(h) || h < 1 || h > 12) {
      setTypeValidation({
        isValid: false,
        message: '⚠️ Hour must be between 1 and 12',
        parsedDate: null,
      });
      return false;
    }

    if (isNaN(min) || min < 0 || min > 59) {
      setTypeValidation({
        isValid: false,
        message: '⚠️ Minute must be between 00 and 59',
        parsedDate: null,
      });
      return false;
    }

    // Convert 12h to 24h
    let militaryHour = h;
    if (pm) {
      if (militaryHour < 12) militaryHour += 12;
    } else {
      if (militaryHour === 12) militaryHour = 0;
    }

    const constructed = new Date(y, m - 1, d, militaryHour, min, 0, 0);
    if (isNaN(constructed.getTime())) {
      setTypeValidation({
        isValid: false,
        message: '⚠️ Invalid date representation',
        parsedDate: null,
      });
      return false;
    }

    setSelectedDate(constructed);
    setViewYear(y);
    setViewMonth(m - 1);
    setHour12(h);
    setMinute(min);
    setIsPM(pm);

    setTypeValidation({
      isValid: true,
      message: `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y} at ${h}:${min.toString().padStart(2, '0')} ${pm ? 'PM' : 'AM'}`,
      parsedDate: constructed,
    });
    return true;
  };

  // Sync selectedDate hours and minutes when stepper time states change
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

    // Sync typable inputs
    setTypeHour(newH12.toString());
    setTypeMinute(newMin.toString().padStart(2, '0'));
    setTypeIsPM(newIsPM);
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

    // Sync typable inputs
    setTypeYear(viewYear.toString());
    setTypeMonth((viewMonth + 1).toString().padStart(2, '0'));
    setTypeDay(day.toString().padStart(2, '0'));
    validateAndSetTyped(
      viewYear.toString(),
      (viewMonth + 1).toString().padStart(2, '0'),
      day.toString().padStart(2, '0'),
      hour12.toString(),
      minute.toString().padStart(2, '0'),
      isPM
    );
  };

  // Quick Presets
  const applyDatePreset = (preset: 'today' | 'tomorrow' | 'weekend' | 'nextWeek') => {
    const target = new Date();
    if (preset === 'today') {
      // keep today
    } else if (preset === 'tomorrow') {
      target.setDate(target.getDate() + 1);
    } else if (preset === 'weekend') {
      const day = target.getDay();
      const daysUntilSaturday = (6 - day + 7) % 7 || 7;
      target.setDate(target.getDate() + daysUntilSaturday);
    } else if (preset === 'nextWeek') {
      target.setDate(target.getDate() + 7);
    }

    target.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setSelectedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());

    const yStr = target.getFullYear().toString();
    const mStr = (target.getMonth() + 1).toString().padStart(2, '0');
    const dStr = target.getDate().toString().padStart(2, '0');
    setTypeYear(yStr);
    setTypeMonth(mStr);
    setTypeDay(dStr);
    validateAndSetTyped(yStr, mStr, dStr, typeHour, typeMinute, typeIsPM);
  };

  // Quick Time Adjusters
  const adjustHour = (delta: number) => {
    let newH = hour12 + delta;
    let newPM = isPM;

    if (newH > 12) {
      newH = 1;
      newPM = !newPM;
    } else if (newH < 1) {
      newH = 12;
      newPM = !newPM;
    }

    setHour12(newH);
    setIsPM(newPM);
    updateWorkingDateTime(newH, minute, newPM);
  };

  const adjustMinute = (delta: number) => {
    let newMin = minute + delta;
    let newH = hour12;
    let newPM = isPM;

    if (newMin >= 60) {
      newMin = newMin % 60;
      adjustHour(1);
      return;
    } else if (newMin < 0) {
      newMin = 60 + (newMin % 60);
      adjustHour(-1);
      return;
    }

    setMinute(newMin);
    updateWorkingDateTime(newH, newMin, newPM);
  };

  const applyTimePreset = (h: number, m: number, pm: boolean) => {
    setHour12(h);
    setMinute(m);
    setIsPM(pm);
    updateWorkingDateTime(h, m, pm);
  };

  const handleConfirm = () => {
    if (activeTab === 'type' && !typeValidation.isValid) {
      // Re-validate to ensure valid
      const ok = validateAndSetTyped(typeYear, typeMonth, typeDay, typeHour, typeMinute, typeIsPM);
      if (!ok) return;
    }
    onConfirm(selectedDate);
    handleDismiss();
  };

  const formattedDateTimePreview = () => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.titleIconBadge, { backgroundColor: Colors.primaryGlow }]}>
                <CustomIcon name="clock" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.modalTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <CustomIcon name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Live Preview Banner */}
          <View style={styles.previewBanner}>
            <CustomIcon name="sparkles" size={14} color={Colors.primary} />
            <Text style={styles.previewText} numberOfLines={1}>
              {formattedDateTimePreview()}
            </Text>
          </View>

          {/* 3 Interactive Mode Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'type' && styles.tabButtonActive]}
              onPress={() => setActiveTab('type')}
              activeOpacity={0.8}
            >
              <CustomIcon
                name="edit"
                size={13}
                color={activeTab === 'type' ? Colors.white : Colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'type' && styles.tabTextActive]}>
                Type Exact
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'calendar' && styles.tabButtonActive]}
              onPress={() => setActiveTab('calendar')}
              activeOpacity={0.8}
            >
              <CustomIcon
                name="calendar"
                size={13}
                color={activeTab === 'calendar' ? Colors.white : Colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}>
                Calendar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'time' && styles.tabButtonActive]}
              onPress={() => setActiveTab('time')}
              activeOpacity={0.8}
            >
              <CustomIcon
                name="clock"
                size={13}
                color={activeTab === 'time' ? Colors.white : Colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'time' && styles.tabTextActive]}>
                Stepper
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* TAB 1: TYPE EXACT (Typable Date & Time with Direct Inputs) */}
            {activeTab === 'type' && (
              <View style={styles.typeTabContent}>
                {/* Date Typable Fields */}
                <Text style={styles.inputGroupTitle}>Enter Date (YYYY / MM / DD):</Text>
                <View style={styles.typeRow}>
                  {/* Year */}
                  <View style={[styles.inputFieldCol, { flex: 1.4 }]}>
                    <Text style={styles.inputFieldLabel}>Year</Text>
                    <TextInput
                      style={styles.typableInput}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder="2026"
                      placeholderTextColor={Colors.textMuted}
                      value={typeYear}
                      onChangeText={(val) => {
                        setTypeYear(val);
                        validateAndSetTyped(val, typeMonth, typeDay, typeHour, typeMinute, typeIsPM);
                      }}
                    />
                  </View>

                  {/* Month */}
                  <View style={[styles.inputFieldCol, { flex: 1 }]}>
                    <Text style={styles.inputFieldLabel}>Month</Text>
                    <TextInput
                      style={styles.typableInput}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="MM"
                      placeholderTextColor={Colors.textMuted}
                      value={typeMonth}
                      onChangeText={(val) => {
                        setTypeMonth(val);
                        validateAndSetTyped(typeYear, val, typeDay, typeHour, typeMinute, typeIsPM);
                      }}
                    />
                  </View>

                  {/* Day */}
                  <View style={[styles.inputFieldCol, { flex: 1 }]}>
                    <Text style={styles.inputFieldLabel}>Day</Text>
                    <TextInput
                      style={styles.typableInput}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="DD"
                      placeholderTextColor={Colors.textMuted}
                      value={typeDay}
                      onChangeText={(val) => {
                        setTypeDay(val);
                        validateAndSetTyped(typeYear, typeMonth, val, typeHour, typeMinute, typeIsPM);
                      }}
                    />
                  </View>
                </View>

                {/* Time Typable Fields */}
                <Text style={[styles.inputGroupTitle, { marginTop: 16 }]}>
                  Enter Time (12-Hour Clock):
                </Text>
                <View style={styles.typeRow}>
                  {/* Hour */}
                  <View style={[styles.inputFieldCol, { flex: 1 }]}>
                    <Text style={styles.inputFieldLabel}>Hour (1-12)</Text>
                    <TextInput
                      style={styles.typableInput}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="12"
                      placeholderTextColor={Colors.textMuted}
                      value={typeHour}
                      onChangeText={(val) => {
                        setTypeHour(val);
                        validateAndSetTyped(typeYear, typeMonth, typeDay, val, typeMinute, typeIsPM);
                      }}
                    />
                  </View>

                  {/* Separator */}
                  <View style={styles.colonWrap}>
                    <Text style={styles.colonText}>:</Text>
                  </View>

                  {/* Minute */}
                  <View style={[styles.inputFieldCol, { flex: 1 }]}>
                    <Text style={styles.inputFieldLabel}>Minute (00-59)</Text>
                    <TextInput
                      style={styles.typableInput}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="00"
                      placeholderTextColor={Colors.textMuted}
                      value={typeMinute}
                      onChangeText={(val) => {
                        setTypeMinute(val);
                        validateAndSetTyped(typeYear, typeMonth, typeDay, typeHour, val, typeIsPM);
                      }}
                    />
                  </View>

                  {/* AM / PM Toggle */}
                  <View style={[styles.inputFieldCol, { flex: 1.2 }]}>
                    <Text style={styles.inputFieldLabel}>Period</Text>
                    <View style={styles.ampmRow}>
                      <TouchableOpacity
                        style={[styles.ampmBtn, !typeIsPM && styles.ampmBtnActive]}
                        onPress={() => {
                          setTypeIsPM(false);
                          validateAndSetTyped(typeYear, typeMonth, typeDay, typeHour, typeMinute, false);
                        }}
                      >
                        <Text style={[styles.ampmBtnText, !typeIsPM && styles.ampmBtnTextActive]}>
                          AM
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.ampmBtn, typeIsPM && styles.ampmBtnActive]}
                        onPress={() => {
                          setTypeIsPM(true);
                          validateAndSetTyped(typeYear, typeMonth, typeDay, typeHour, typeMinute, true);
                        }}
                      >
                        <Text style={[styles.ampmBtnText, typeIsPM && styles.ampmBtnTextActive]}>
                          PM
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 2: CALENDAR VIEW */}
            {activeTab === 'calendar' && (
              <View style={styles.dateTabContent}>
                {/* Month Navigator */}
                <View style={styles.monthNavigator}>
                  <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrowBtn}>
                    <CustomIcon name="chevron-left" size={16} color={Colors.primary} />
                  </TouchableOpacity>

                  <Text style={styles.monthYearTitle}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </Text>

                  <TouchableOpacity onPress={handleNextMonth} style={styles.navArrowBtn}>
                    <CustomIcon name="chevron-right" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Days of Week Header */}
                <View style={styles.weekDaysRow}>
                  {DAYS_OF_WEEK.map((d, index) => (
                    <Text key={index} style={styles.weekDayText}>
                      {d}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {Array.from({ length: firstDay }).map((_, index) => (
                    <View key={`empty-${index}`} style={styles.emptyDayCell} />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const isSelected =
                      selectedDate.getFullYear() === viewYear &&
                      selectedDate.getMonth() === viewMonth &&
                      selectedDate.getDate() === day;

                    const isToday =
                      new Date().getFullYear() === viewYear &&
                      new Date().getMonth() === viewMonth &&
                      new Date().getDate() === day;

                    return (
                      <TouchableOpacity
                        key={`day-${day}`}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          isToday && !isSelected && styles.dayCellToday,
                        ]}
                        onPress={() => handleDaySelect(day)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            isSelected && styles.dayCellTextSelected,
                            isToday && !isSelected && styles.dayCellTextToday,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* TAB 3: STEPPER TIME VIEW */}
            {activeTab === 'time' && (
              <View style={styles.timeTabContent}>
                <View style={styles.clockHeroCard}>
                  {/* Hours Controls */}
                  <View style={styles.timeCol}>
                    <TouchableOpacity
                      style={styles.stepperArrow}
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
                      style={styles.stepperArrow}
                      onPress={() => adjustHour(-1)}
                    >
                      <CustomIcon name="chevron-down" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.timeUnitLabel}>HOURS</Text>
                  </View>

                  <Text style={styles.clockColon}>:</Text>

                  {/* Minutes Controls */}
                  <View style={styles.timeCol}>
                    <TouchableOpacity
                      style={styles.stepperArrow}
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
                      style={styles.stepperArrow}
                      onPress={() => adjustMinute(-5)}
                    >
                      <CustomIcon name="chevron-down" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.timeUnitLabel}>MINUTES</Text>
                  </View>

                  {/* AM/PM Toggle */}
                  <View style={styles.ampmSelector}>
                    <TouchableOpacity
                      style={[styles.ampmCard, !isPM && styles.ampmCardActive]}
                      onPress={() => {
                        setIsPM(false);
                        updateWorkingDateTime(hour12, minute, false);
                      }}
                    >
                      <Text style={[styles.ampmText, !isPM && styles.ampmTextActive]}>
                        AM
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.ampmCard, isPM && styles.ampmCardActive]}
                      onPress={() => {
                        setIsPM(true);
                        updateWorkingDateTime(hour12, minute, true);
                      }}
                    >
                      <Text style={[styles.ampmText, isPM && styles.ampmTextActive]}>
                        PM
                      </Text>
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
              style={[
                styles.confirmButton,
                activeTab === 'type' && !typeValidation.isValid && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <CustomIcon name="check" size={15} color={Colors.white} />
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
    backgroundColor: 'rgba(43, 37, 33, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.border,
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    shadowColor: 'rgba(197, 145, 88, 0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: Colors.bgSecondary,
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5ECE0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewText: {
    fontSize: 13,
    color: Colors.primaryDark,
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
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F5ECE0',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  contentScroll: {
    maxHeight: 380,
  },
  typeTabContent: {
    padding: 16,
  },
  validationPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  validationValid: {
    backgroundColor: 'rgba(91, 138, 97, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(91, 138, 97, 0.35)',
  },
  validationInvalid: {
    backgroundColor: 'rgba(200, 90, 72, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200, 90, 72, 0.35)',
  },
  validationText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputFieldCol: {
    marginBottom: 4,
  },
  inputFieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  typableInput: {
    backgroundColor: '#F5ECE0',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  colonWrap: {
    justifyContent: 'center',
    paddingTop: 14,
  },
  colonText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  ampmRow: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#F5ECE0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  ampmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmBtnActive: {
    backgroundColor: Colors.primary,
  },
  ampmBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  ampmBtnTextActive: {
    color: Colors.white,
  },
  quickChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickFillChip: {
    backgroundColor: '#F5ECE0',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  quickFillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  dateTabContent: {
    padding: 16,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5ECE0',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emptyDayCell: {
    width: `${100 / 7}%`,
    height: 36,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dayCellTextSelected: {
    color: Colors.white,
    fontWeight: '800',
  },
  dayCellTextToday: {
    color: Colors.primary,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 14,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#F5ECE0',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  timeTabContent: {
    padding: 16,
  },
  clockHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F5ECE0',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeCol: {
    alignItems: 'center',
  },
  stepperArrow: {
    padding: 6,
  },
  digitBox: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 64,
    alignItems: 'center',
  },
  digitText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  timeUnitLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  clockColon: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 16,
  },
  ampmSelector: {
    gap: 8,
    marginLeft: 6,
  },
  ampmCard: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ampmCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ampmText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  ampmTextActive: {
    color: Colors.white,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F5ECE0',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
