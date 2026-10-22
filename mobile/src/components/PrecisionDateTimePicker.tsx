import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { CustomIcon } from './CustomIcon';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  title?: string;
  accentColor?: string;
}

export const PrecisionDateTimePicker: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  initialDate,
  title = 'Set Date & Time',
}) => {
  // Numeric date/time states
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [isPM, setIsPM] = useState(false);

  // String states for natural typing
  const [dayStr, setDayStr] = useState('22');
  const [monthStr, setMonthStr] = useState('10');
  const [yearStr, setYearStr] = useState('2026');
  const [hourStr, setHourStr] = useState('08');
  const [minuteStr, setMinuteStr] = useState('00');

  // Currently focused field to apply focus highlight and auto-scroll
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // First character flag per field so typing over initial values works seamlessly
  const firstCharRef = useRef<{ [key: string]: boolean }>({});
  const scrollRef = useRef<any>(null);

  // Listen to keyboard show/hide events to shift view upward
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setFocusedField(null);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Sync state whenever modal opens
  useEffect(() => {
    if (visible) {
      const d = initialDate ? new Date(initialDate) : new Date();
      setSelectedDate(d);

      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();

      let h = d.getHours();
      const pm = h >= 12;
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;
      const min = d.getMinutes();

      setIsPM(pm);
      setYearStr(y.toString());
      setMonthStr(m.toString().padStart(2, '0'));
      setDayStr(day.toString().padStart(2, '0'));
      setHourStr(h12.toString().padStart(2, '0'));
      setMinuteStr(min.toString().padStart(2, '0'));
      firstCharRef.current = {};
    }
  }, [visible, initialDate]);

  // Helper to commit typed or stepped values to Date
  const commitValues = (
    yVal: string,
    mVal: string,
    dVal: string,
    hVal: string,
    minVal: string,
    pmVal: boolean
  ) => {
    let y = parseInt(yVal, 10);
    let m = parseInt(mVal, 10);
    let d = parseInt(dVal, 10);
    let h12 = parseInt(hVal, 10);
    let min = parseInt(minVal, 10);

    if (isNaN(y) || y < 2024) y = new Date().getFullYear();
    if (isNaN(m) || m < 1) m = 1;
    if (m > 12) m = 12;
    if (isNaN(d) || d < 1) d = 1;
    const maxDays = new Date(y, m, 0).getDate();
    if (d > maxDays) d = maxDays;

    if (isNaN(h12) || h12 < 1) h12 = 12;
    if (h12 > 12) h12 = 12;
    if (isNaN(min) || min < 0) min = 0;
    if (min > 59) min = 59;

    let militaryH = h12 % 12;
    if (pmVal) militaryH += 12;

    const constructed = new Date(y, m - 1, d, militaryH, min, 0, 0);
    setSelectedDate(constructed);

    setYearStr(y.toString());
    setMonthStr(m.toString().padStart(2, '0'));
    setDayStr(d.toString().padStart(2, '0'));
    setHourStr(h12.toString().padStart(2, '0'));
    setMinuteStr(min.toString().padStart(2, '0'));
    setIsPM(pmVal);
  };

  // Focus Handlers with Auto-scroll
  const handleFieldFocus = (field: string) => {
    setFocusedField(field);
    firstCharRef.current[field] = true;

    // Shift scroll so focused field is clearly visible
    setTimeout(() => {
      if (field === 'hour' || field === 'minute') {
        scrollRef.current?.scrollTo({ y: 150, animated: true });
      } else {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    }, 100);
  };

  // Fluid Typing Handlers (never blocked by strict maxLength)
  const handleDayChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      setDayStr('');
      return;
    }
    if (firstCharRef.current['day']) {
      firstCharRef.current['day'] = false;
      const newDigit = digits.length > 2 ? digits.slice(-1) : digits;
      setDayStr(newDigit);
      return;
    }
    if (digits.length <= 2) {
      const num = parseInt(digits, 10);
      setDayStr(num > 31 ? '31' : digits);
    } else {
      setDayStr(digits.slice(-2));
    }
  };

  const handleMonthChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      setMonthStr('');
      return;
    }
    if (firstCharRef.current['month']) {
      firstCharRef.current['month'] = false;
      const newDigit = digits.length > 2 ? digits.slice(-1) : digits;
      setMonthStr(newDigit);
      return;
    }
    if (digits.length <= 2) {
      const num = parseInt(digits, 10);
      setMonthStr(num > 12 ? '12' : digits);
    } else {
      setMonthStr(digits.slice(-2));
    }
  };

  const handleYearChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      setYearStr('');
      return;
    }
    if (firstCharRef.current['year']) {
      firstCharRef.current['year'] = false;
      if (digits.length > 4) {
        setYearStr(digits.slice(-1));
        return;
      }
    }
    if (digits.length <= 4) {
      setYearStr(digits);
    } else {
      setYearStr(digits.slice(-4));
    }
  };

  const handleHourChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      setHourStr('');
      return;
    }
    if (firstCharRef.current['hour']) {
      firstCharRef.current['hour'] = false;
      const newDigit = digits.length > 2 ? digits.slice(-1) : digits;
      setHourStr(newDigit);
      return;
    }
    if (digits.length <= 2) {
      const num = parseInt(digits, 10);
      if (num > 12) {
        if (num <= 23) {
          setIsPM(true);
          setHourStr((num - 12).toString().padStart(2, '0'));
        } else {
          setHourStr('12');
        }
      } else {
        setHourStr(digits);
      }
    } else {
      setHourStr(digits.slice(-2));
    }
  };

  const handleMinuteChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      setMinuteStr('');
      return;
    }
    if (firstCharRef.current['minute']) {
      firstCharRef.current['minute'] = false;
      const newDigit = digits.length > 2 ? digits.slice(-1) : digits;
      setMinuteStr(newDigit);
      return;
    }
    if (digits.length <= 2) {
      const num = parseInt(digits, 10);
      setMinuteStr(num > 59 ? '59' : digits);
    } else {
      setMinuteStr(digits.slice(-2));
    }
  };

  // Adjust Date Steppers
  const adjustDay = (delta: number) => {
    const current = new Date(selectedDate.getTime() + delta * 24 * 60 * 60 * 1000);
    commitValues(
      current.getFullYear().toString(),
      (current.getMonth() + 1).toString(),
      current.getDate().toString(),
      hourStr,
      minuteStr,
      isPM
    );
  };

  const adjustMonth = (delta: number) => {
    let m = parseInt(monthStr, 10) + delta;
    let y = parseInt(yearStr, 10);
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    commitValues(y.toString(), m.toString(), dayStr, hourStr, minuteStr, isPM);
  };

  const adjustYear = (delta: number) => {
    const y = parseInt(yearStr, 10) + delta;
    commitValues(y.toString(), monthStr, dayStr, hourStr, minuteStr, isPM);
  };

  // Adjust Time Steppers (1 Hour / 1 Minute)
  const adjustHour = (delta: number) => {
    let h = parseInt(hourStr, 10) + delta;
    let pm = isPM;
    if (h > 12) {
      h = 1;
      pm = !pm;
    } else if (h < 1) {
      h = 12;
      pm = !pm;
    }
    commitValues(yearStr, monthStr, dayStr, h.toString(), minuteStr, pm);
  };

  const adjustMinute = (delta: number) => {
    let min = parseInt(minuteStr, 10) + delta;
    let h = parseInt(hourStr, 10);
    let pm = isPM;

    if (min >= 60) {
      min = 0;
      h += 1;
      if (h > 12) {
        h = 1;
        pm = !pm;
      }
    } else if (min < 0) {
      min = 59;
      h -= 1;
      if (h < 1) {
        h = 12;
        pm = !pm;
      }
    }
    commitValues(yearStr, monthStr, dayStr, h.toString(), min.toString(), pm);
  };

  const handleToggleAMPM = (targetPM: boolean) => {
    setIsPM(targetPM);
    commitValues(yearStr, monthStr, dayStr, hourStr, minuteStr, targetPM);
  };

  const handleConfirm = () => {
    Keyboard.dismiss();
    commitValues(yearStr, monthStr, dayStr, hourStr, minuteStr, isPM);
    onConfirm(selectedDate);
    onClose();
  };

  const formattedPreview = () => {
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

  const windowHeight = Dimensions.get('window').height;
  const isKeyboardOpen = keyboardHeight > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={[styles.modalOverlay, isKeyboardOpen && { paddingBottom: keyboardHeight }]}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={[
                styles.modalCard,
                isKeyboardOpen && {
                  maxHeight: windowHeight - keyboardHeight - 20,
                  paddingBottom: 16,
                },
              ]}
            >
              <View style={styles.sheetHandle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.titleText}>{title}</Text>
                  {isKeyboardOpen && (
                    <Text style={styles.typingNoticeText}>Type numbers or tap Done</Text>
                  )}
                </View>

                <View style={styles.headerRightActions}>
                  {isKeyboardOpen ? (
                    <TouchableOpacity
                      onPress={Keyboard.dismiss}
                      style={styles.doneTypingBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.doneTypingText}>Done ✓</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                      <CustomIcon name="close" size={16} color="#7A6E61" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Live Preview Display (compact when keyboard is open) */}
              <View style={[styles.previewBanner, isKeyboardOpen && styles.previewBannerCompact]}>
                <Text style={styles.previewIcon}>📅</Text>
                <Text style={styles.previewText}>{formattedPreview()}</Text>
              </View>

              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={[styles.bodyScroll, isKeyboardOpen && { maxHeight: 250 }]}
              >
                {/* SECTION 1: SET DATE (Day / Month / Year) */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeader}>SET DATE</Text>
                  <View style={styles.clockRow}>
                    {/* Day Box */}
                    <View style={styles.digitCol}>
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustDay(1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.bigDigitInput,
                          focusedField === 'day' && styles.bigDigitInputActive,
                        ]}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        maxLength={3}
                        value={dayStr}
                        onFocus={() => handleFieldFocus('day')}
                        onChangeText={handleDayChange}
                        onBlur={() => {
                          setFocusedField(null);
                          commitValues(yearStr, monthStr, dayStr, hourStr, minuteStr, isPM);
                        }}
                      />
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustDay(-1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>DAY</Text>
                    </View>

                    <Text style={styles.clockDivider}>/</Text>

                    {/* Month Box */}
                    <View style={styles.digitCol}>
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustMonth(1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.bigDigitInput,
                          focusedField === 'month' && styles.bigDigitInputActive,
                        ]}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        maxLength={3}
                        value={monthStr}
                        onFocus={() => handleFieldFocus('month')}
                        onChangeText={handleMonthChange}
                        onBlur={() => {
                          setFocusedField(null);
                          commitValues(yearStr, monthStr, dayStr, hourStr, minuteStr, isPM);
                        }}
                      />
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustMonth(-1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>MONTH</Text>
                    </View>

                    <Text style={styles.clockDivider}>/</Text>

                    {/* Year Box */}
                    <View style={[styles.digitCol, { minWidth: 80 }]}>
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustYear(1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.bigDigitInput,
                          { width: 80 },
                          focusedField === 'year' && styles.bigDigitInputActive,
                        ]}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        maxLength={5}
                        value={yearStr}
                        onFocus={() => handleFieldFocus('year')}
                        onChangeText={handleYearChange}
                        onBlur={() => {
                          setFocusedField(null);
                          commitValues(yearStr, monthStr, dayStr, hourStr, minuteStr, isPM);
                        }}
                      />
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustYear(-1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>YEAR</Text>
                    </View>
                  </View>
                </View>

                {/* SECTION 2: SET TIME (Hours / Minutes / AM-PM) */}
                <View style={[styles.sectionCard, { marginTop: 14 }]}>
                  <Text style={styles.sectionHeader}>SET TIME</Text>
                  <View style={styles.clockRow}>
                    {/* Hours (Up / Down 1 Hour or Direct Type) */}
                    <View style={styles.digitCol}>
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustHour(1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.bigDigitInput,
                          focusedField === 'hour' && styles.bigDigitInputActive,
                        ]}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        maxLength={3}
                        value={hourStr}
                        onFocus={() => handleFieldFocus('hour')}
                        onChangeText={handleHourChange}
                        onBlur={() => {
                          setFocusedField(null);
                          commitValues(yearStr, monthStr, dayStr, hourStr, minuteStr, isPM);
                        }}
                      />
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustHour(-1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>HOURS (±1h)</Text>
                    </View>

                    <Text style={styles.clockDivider}>:</Text>

                    {/* Minutes (Up / Down 1 Minute or Direct Type) */}
                    <View style={styles.digitCol}>
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustMinute(1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.bigDigitInput,
                          focusedField === 'minute' && styles.bigDigitInputActive,
                        ]}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        maxLength={3}
                        value={minuteStr}
                        onFocus={() => handleFieldFocus('minute')}
                        onChangeText={handleMinuteChange}
                        onBlur={() => {
                          setFocusedField(null);
                          commitValues(yearStr, monthStr, dayStr, hourStr, minuteStr, isPM);
                        }}
                      />
                      <TouchableOpacity
                        style={styles.arrowBtn}
                        onPress={() => adjustMinute(-1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>MINUTES (±1m)</Text>
                    </View>

                    {/* AM / PM Toggle Cards */}
                    <View style={styles.ampmCol}>
                      <TouchableOpacity
                        style={[styles.ampmCard, !isPM && styles.ampmCardActive]}
                        onPress={() => handleToggleAMPM(false)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.ampmCardText, !isPM && styles.ampmCardTextActive]}>
                          AM
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.ampmCard, isPM && styles.ampmCardActive]}
                        onPress={() => handleToggleAMPM(true)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.ampmCardText, isPM && styles.ampmCardTextActive]}>
                          PM
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionsFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { Keyboard.dismiss(); onClose(); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnText}>Set Date & Time</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(35, 27, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1.5,
    borderColor: '#ECE3D4',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0D4C3',
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5D7',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2521',
  },
  typingNoticeText: {
    fontSize: 11,
    color: '#C59158',
    fontWeight: '600',
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneTypingBtn: {
    backgroundColor: '#C59158',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  doneTypingText: {
    color: '#FFFDF9',
    fontSize: 12,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: 'rgba(197, 145, 88, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 10,
    gap: 8,
  },
  previewBannerCompact: {
    paddingVertical: 6,
    marginBottom: 6,
    marginTop: 6,
  },
  previewIcon: {
    fontSize: 15,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C59158',
  },
  bodyScroll: {
    maxHeight: 380,
  },
  sectionCard: {
    backgroundColor: '#FAF6EE',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE3D4',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A7B6D',
    letterSpacing: 0.8,
    marginBottom: 12,
    textAlign: 'center',
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  digitCol: {
    alignItems: 'center',
    minWidth: 64,
  },
  arrowBtn: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6DCCF',
  },
  arrowText: {
    fontSize: 12,
    color: '#C59158',
    fontWeight: '800',
  },
  bigDigitInput: {
    width: 64,
    height: 56,
    backgroundColor: '#FFFDF9',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E6DCCF',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: '#2B2521',
    marginVertical: 6,
    padding: 0,
  },
  bigDigitInputActive: {
    borderColor: '#C59158',
    backgroundColor: '#FFF9F2',
    shadowColor: '#C59158',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  digitSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A39586',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  clockDivider: {
    fontSize: 26,
    fontWeight: '800',
    color: '#C59158',
    marginTop: -16,
  },
  ampmCol: {
    flexDirection: 'column',
    gap: 6,
    marginLeft: 6,
    justifyContent: 'center',
  },
  ampmCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#E6DCCF',
    alignItems: 'center',
  },
  ampmCardActive: {
    backgroundColor: '#C59158',
    borderColor: '#C59158',
  },
  ampmCardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A7B6D',
  },
  ampmCardTextActive: {
    color: '#FFFDF9',
  },
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0E5D7',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#E0D4C3',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A7B6D',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#C59158',
    alignItems: 'center',
    shadowColor: '#C59158',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFDF9',
  },
});
