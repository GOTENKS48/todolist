package com.mobileapp

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class TaskNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "TaskNotificationModule"
    }

    @ReactMethod
    fun scheduleNotification(id: String, title: String, message: String, triggerTimeMs: Double) {
        val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(reactContext, NotificationAlarmReceiver::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("notificationId", id.hashCode())
        }

        val flag = PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        val pendingIntent = PendingIntent.getBroadcast(
            reactContext,
            id.hashCode(),
            intent,
            flag
        )

        val triggerTime = triggerTimeMs.toLong()
        if (triggerTime <= System.currentTimeMillis()) {
            reactContext.sendBroadcast(intent)
            return
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
            }
        } catch (_: Exception) {
            // Fallback for systems that restrict exact alarms
            alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
        }
    }

    @ReactMethod
    fun showNotificationNow(id: String, title: String, message: String) {
        val intent = Intent(reactContext, NotificationAlarmReceiver::class.java).apply {
            putExtra("title", title)
            putExtra("message", message)
            putExtra("notificationId", id.hashCode())
        }
        reactContext.sendBroadcast(intent)
    }

    @ReactMethod
    fun cancelNotification(id: String) {
        val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(reactContext, NotificationAlarmReceiver::class.java)
        val flag = PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        val pendingIntent = PendingIntent.getBroadcast(
            reactContext,
            id.hashCode(),
            intent,
            flag
        )
        alarmManager.cancel(pendingIntent)
    }
}
