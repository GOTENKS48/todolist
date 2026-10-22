package com.mobileapp

import android.app.Activity
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class TaskNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var imagePickerPromise: Promise? = null

    companion object {
        const val IMAGE_PICKER_REQUEST = 9921
    }

    init {
        reactContext.addActivityEventListener(this)
        createChannel()
    }

    override fun getName(): String {
        return "TaskNotificationModule"
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(
                NotificationAlarmReceiver.CHANNEL_ID,
                NotificationAlarmReceiver.CHANNEL_NAME,
                importance
            ).apply {
                description = "High priority TaskOrbit deadline alerts"
                enableVibration(true)
                enableLights(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            notificationManager?.createNotificationChannel(channel)
        }
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
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
                } else {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
                }
            } catch (_: Exception) {
                // Ignore OS alarm constraints
            }
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

    @ReactMethod
    fun pickImage(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity does not exist")
            return
        }
        imagePickerPromise = promise
        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
                addCategory(Intent.CATEGORY_OPENABLE)
            }
            activity.startActivityForResult(
                Intent.createChooser(intent, "Select Profile Picture"),
                IMAGE_PICKER_REQUEST
            )
        } catch (e: Exception) {
            imagePickerPromise?.reject("PICKER_ERROR", e.message)
            imagePickerPromise = null
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == IMAGE_PICKER_REQUEST) {
            if (resultCode == Activity.RESULT_OK && data != null && data.data != null) {
                val imageUri = data.data.toString()
                imagePickerPromise?.resolve(imageUri)
            } else {
                imagePickerPromise?.reject("CANCELLED", "User cancelled image selection")
            }
            imagePickerPromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {}
}
