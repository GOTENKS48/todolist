import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { CustomIcon } from './CustomIcon';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  title?: string;
  accentColor?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PrecisionDateTimePicker: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  initialDate,
  title = 'Set Date & Time',
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());

  // Date States (Year, Month 1-12, Day 1-31)
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10); // 1-12
  const [day, setDay] = useState(22);

  // Time States (Hour 1-12, Minute 0-59, AM/PM)
  const [hour12, setHour12] = useState(8);
  const [minute, setMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (visible) {
      const d = initialDate ? new Date(initialDate) : new Date();
      setSelectedDate(d);
      setYear(d.getFullYear());
      setMonth(d.getMonth() + 1);
      setDay(d.getDate());

      let h = d.getHours();
      const pm = h >= 12;
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;

      setHour12(h12);
      setMinute(d.getMinutes());
      setIsPM(pm);
    }
  }, [visible, initialDate]);

  // Sync internal selectedDate
  const updateDate = (newY: number, newM: number, newD: number, newH12: number, newMin: number, newPM: boolean) => {
    let militaryHour = newH12 % 12;
    if (newPM) militaryHour += 12;

    const daysInTargetMonth = new Date(newY, newM, 0).getDate();
    const clampedDay = Math.min(Math.max(1, newD), daysInTargetMonth);

    const updated = new Date(newY, newM - 1, clampedDay, militaryHour, newMin, 0, 0);
    setSelectedDate(updated);
    setYear(newY);
    setMonth(newM);
    setDay(clampedDay);
    setHour12(newH12);
    setMinute(newMin);
    setIsPM(newPM);
  };

  // Date Adjusters
  const adjustDay = (delta: number) => {
    const nextDate = new Date(selectedDate.getTime() + delta * 24 * 60 * 60 * 1000);
    updateDate(
      nextDate.getFullYear(),
      nextDate.getMonth() + 1,
      nextDate.getDate(),
      hour12,
      minute,
      isPM
    );
  };

  const adjustMonth = (delta: number) => {
    let nextM = month + delta;
    let nextY = year;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    } else if (nextM < 1) {
      nextM = 12;
      nextY -= 1;
    }
    updateDate(nextY, nextM, day, hour12, minute, isPM);
  };

  const adjustYear = (delta: number) => {
    updateDate(year + delta, month, day, hour12, minute, isPM);
  };

  // Time Adjusters (+1 Hour / -1 Hour)
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
    updateDate(year, month, day, newH, minute, newPM);
  };

  // Time Adjusters (+1 Minute / -1 Minute)
  const adjustMinute = (delta: number) => {
    let newMin = minute + delta;
    let newH = hour12;
    let newPM = isPM;

    if (newMin >= 60) {
      newMin = 0;
      adjustHour(1);
      return;
    } else if (newMin < 0) {
      newMin = 59;
      adjustHour(-1);
      return;
    }

    updateDate(year, month, day, newH, newMin, newPM);
  };

  const handleConfirm = () => {
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

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.sheetHandle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.titleWithIcon}>
                  <Text style={styles.titleText}>{title}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <CustomIcon name="close" size={16} color="#7A6E61" />
                </TouchableOpacity>
              </View>

              {/* Live Preview Display */}
              <View style={styles.previewBanner}>
                <Text style={styles.previewIcon}>📅</Text>
                <Text style={styles.previewText}>{formattedPreview()}</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.bodyScroll}>
                {/* SECTION 1: SET DATE (Big Clock-like Fields) */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeader}>SET DATE</Text>
                  <View style={styles.clockRow}>
                    {/* Day Box */}
                    <View style={styles.digitCol}>
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustDay(1)}>
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.bigDigitInput}
                        keyboardType="numeric"
                        maxLength={2}
                        value={day.toString().padStart(2, '0')}
                        onChangeText={(val) => {
                          const n = parseInt(val, 10);
                          if (!isNaN(n)) updateDate(year, month, n, hour12, minute, isPM);
                        }}
                      />
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustDay(-1)}>
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>DAY</Text>
                    </View>

                    <Text style={styles.clockDivider}>/</Text>

                    {/* Month Box */}
                    <View style={styles.digitCol}>
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustMonth(1)}>
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.bigDigitInput}
                        keyboardType="numeric"
                        maxLength={2}
                        value={month.toString().padStart(2, '0')}
                        onChangeText={(val) => {
                          const n = parseInt(val, 10);
                          if (!isNaN(n) && n >= 1 && n <= 12) updateDate(year, n, day, hour12, minute, isPM);
                        }}
                      />
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustMonth(-1)}>
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>MONTH</Text>
                    </View>

                    <Text style={styles.clockDivider}>/</Text>

                    {/* Year Box */}
                    <View style={[styles.digitCol, { minWidth: 80 }]}>
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustYear(1)}>
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.bigDigitInput, { width: 80 }]}
                        keyboardType="numeric"
                        maxLength={4}
                        value={year.toString()}
                        onChangeText={(val) => {
                          const n = parseInt(val, 10);
                          if (!isNaN(n) && n >= 2024 && n <= 2040) updateDate(n, month, day, hour12, minute, isPM);
                        }}
                      />
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustYear(-1)}>
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>YEAR</Text>
                    </View>
                  </View>

                  {/* Quick Date Shortcuts */}
                  <View style={styles.quickButtonsRow}>
                    <TouchableOpacity
                      style={styles.quickBtn}
                      onPress={() => {
                        const now = new Date();
                        updateDate(now.getFullYear(), now.getMonth() + 1, now.getDate(), hour12, minute, isPM);
                      }}
                    >
                      <Text style={styles.quickBtnText}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => adjustDay(1)}>
                      <Text style={styles.quickBtnText}>+1 Day</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => adjustDay(7)}>
                      <Text style={styles.quickBtnText}>+1 Week</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* SECTION 2: SET TIME (Big Clock Display) */}
                <View style={[styles.sectionCard, { marginTop: 14 }]}>
                  <Text style={styles.sectionHeader}>SET TIME</Text>
                  <View style={styles.clockRow}>
                    {/* Hours (Up / Down 1 Hour or Type) */}
                    <View style={styles.digitCol}>
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustHour(1)}>
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.bigDigitInput}
                        keyboardType="numeric"
                        maxLength={2}
                        value={hour12.toString().padStart(2, '0')}
                        onChangeText={(val) => {
                          const n = parseInt(val, 10);
                          if (!isNaN(n) && n >= 1 && n <= 12) updateDate(year, month, day, n, minute, isPM);
                        }}
                      />
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustHour(-1)}>
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>HOURS (±1h)</Text>
                    </View>

                    <Text style={styles.clockDivider}>:</Text>

                    {/* Minutes (Up / Down 1 Minute or Type) */}
                    <View style={styles.digitCol}>
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustMinute(1)}>
                        <Text style={styles.arrowText}>▲</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.bigDigitInput}
                        keyboardType="numeric"
                        maxLength={2}
                        value={minute.toString().padStart(2, '0')}
                        onChangeText={(val) => {
                          const n = parseInt(val, 10);
                          if (!isNaN(n) && n >= 0 && n <= 59) updateDate(year, month, day, hour12, n, isPM);
                        }}
                      />
                      <TouchableOpacity style={styles.arrowBtn} onPress={() => adjustMinute(-1)}>
                        <Text style={styles.arrowText}>▼</Text>
                      </TouchableOpacity>
                      <Text style={styles.digitSubLabel}>MINUTES (±1m)</Text>
                    </View>

                    {/* AM / PM Toggle Cards */}
                    <View style={styles.ampmCol}>
                      <TouchableOpacity
                        style={[styles.ampmCard, !isPM && styles.ampmCardActive]}
                        onPress={() => updateDate(year, month, day, hour12, minute, false)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.ampmCardText, !isPM && styles.ampmCardTextActive]}>AM</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.ampmCard, isPM && styles.ampmCardActive]}
                        onPress={() => updateDate(year, month, day, hour12, minute, true)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.ampmCardText, isPM && styles.ampmCardTextActive]}>PM</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quick Minute Jumpers */}
                  <View style={styles.quickButtonsRow}>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => adjustMinute(5)}>
                      <Text style={styles.quickBtnText}>+5 Min</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => adjustMinute(15)}>
                      <Text style={styles.quickBtnText}>+15 Min</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => adjustMinute(30)}>
                      <Text style={styles.quickBtnText}>+30 Min</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => adjustHour(1)}>
                      <Text style={styles.quickBtnText}>+1 Hour</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionsFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
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
    paddingBottom: 28,
    maxHeight: '88%',
    borderWidth: 1.5,
    borderColor: '#ECE3D4',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0D4C3',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E5D7',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2521',
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
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
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
    maxHeight: 460,
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
    width: 44,
    height: 30,
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
    height: 58,
    backgroundColor: '#FFFDF9',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C59158',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: '#2B2521',
    marginVertical: 6,
    padding: 0,
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
  quickButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  quickBtn: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(197, 145, 88, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A644D',
  },
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    paddingTop: 12,
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
