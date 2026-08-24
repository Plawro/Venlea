import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  constructor() {
    this.hasPermission = false;
    this.isNative = Capacitor.isNativePlatform();
  }

  async init() {
    if (this.isNative) {
      try {
        const check = await LocalNotifications.checkPermissions();
        if (check.display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          this.hasPermission = request.display === 'granted';
        } else {
          this.hasPermission = true;
        }
      } catch (e) {
        console.warn('Failed to initialize Capacitor LocalNotifications', e);
      }
    } else {
      // Web Fallback
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          this.hasPermission = true;
        } else if (Notification.permission !== 'denied') {
          try {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === 'granted';
          } catch (e) {
            console.warn('Failed to request web notification permissions', e);
          }
        }
        
        // Also start a ticker for web notifications if active
        if (this.hasPermission) {
          this.startWebTicker();
        }
      }
    }
  }

  // --- Web specific scheduling ---
  // Since Web Notifications API doesn't have background scheduling without a service worker,
  // we do a naive timeout/interval check while the app is open.
  webSchedule = [];
  webTicker = null;

  startWebTicker() {
    if (this.webTicker) clearInterval(this.webTicker);
    this.webTicker = setInterval(() => {
      const now = Date.now();
      const toTrigger = this.webSchedule.filter(item => item.at <= now);
      
      toTrigger.forEach(item => {
        new Notification(item.title, { body: item.body });
        // Optional: play a sound
      });
      
      // Remove triggered
      this.webSchedule = this.webSchedule.filter(item => item.at > now);
    }, 10000); // check every 10s
  }

  // Common scheduler
  async schedule({ id, title, body, dateStr, timeStr }) {
    if (!this.hasPermission) return;
    if (!dateStr) return; // No date set

    // Parse target date
    const target = new Date(dateStr);
    
    // If timeStr is provided (like "09:00"), parse HH:MM
    if (timeStr) {
      const [h, m] = timeStr.split(':');
      target.setHours(parseInt(h, 10));
      target.setMinutes(parseInt(m, 10));
      target.setSeconds(0);
    } else {
      // Default to 9:00 AM on the day
      target.setHours(9, 0, 0, 0);
    }

    if (target.getTime() <= Date.now()) {
      // Date is in the past, don't schedule
      return;
    }

    if (this.isNative) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: id,
              schedule: { at: target },
              sound: null,
              attachments: null,
              actionTypeId: "",
              extra: null
            }
          ]
        });
      } catch (e) {
        console.warn('Error scheduling native notification:', e);
      }
    } else {
      // Web
      this.webSchedule.push({ id, title, body, at: target.getTime() });
    }
  }

  async cancel(id) {
    if (this.isNative) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id }] });
      } catch (e) {
        console.warn('Error canceling native notification:', e);
      }
    } else {
      this.webSchedule = this.webSchedule.filter(item => item.id !== id);
    }
  }

  // Entities specific helpers
  async scheduleTodo(todo) {
    if (todo.done) {
      await this.cancel(todo.id);
      return;
    }
    if (!todo.date) return;
    
    await this.schedule({
      id: todo.id,
      title: 'Opakováni: Úkol pro dnešek',
      body: todo.title,
      dateStr: todo.date,
      timeStr: '09:00' // Default todo reminder
    });
  }

  async scheduleEvent(event) {
    if (!event.date || !event.time) return;
    
    await this.schedule({
      id: event.id,
      title: 'Událost začíná brzy',
      body: event.name,
      dateStr: event.date,
      timeStr: event.time
    });
  }
}

export const notificationService = new NotificationService();
