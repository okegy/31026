# 🎯 Appointment Trigger Commands Guide

## 🚀 **COMPLETE TRIGGER SYSTEM**

### **📱 How to Use Triggers:**
Simply type any trigger command in the chatbot or system to activate the corresponding feature.

---

## **👤 PATIENT TRIGGER COMMANDS**

### **Appointment Booking:**
```
!book I need to book a routine checkup for next week
!urgent I have severe chest pain and need immediate attention
!check Show available appointments for tomorrow morning
!schedule View my upcoming appointments
!reschedule I need to move my appointment to next week
!cancel Cancel my appointment for tomorrow
```

### **Authentication:**
```
!login-patient alice@medschedule.com patient123
!register-patient John Doe
!quick-login patient
!logout
```

### **Information:**
```
!help Show all available commands
!status Check system status
!test Test appointment booking
```

---

## **👨‍⚕️ DOCTOR TRIGGER COMMANDS**

### **Schedule Management:**
```
!schedule Show my appointments for today
!waitlist Display my patient waitlist
!today Show today's schedule
!patients List my patients
!slots Add available time slots for tomorrow afternoon
```

### **Authentication:**
```
!login-doctor michael@medschedule.com doctor123
!register-doctor Dr. Sarah Smith
!quick-login doctor
!logout
```

### **Information:**
```
!help Show all available commands
!status Check system status
!test Test system functionality
```

---

## **🔥 QUICK START TRIGGERS**

### **For Immediate Booking:**
```
!book urgent appointment chest pain
!urgent headache severe migraine
!check available tomorrow morning
!quick-login patient
```

### **For Doctors:**
```
!quick-login doctor
!schedule today
!waitlist
!slots tomorrow 2pm-4pm
```

---

## **📝 EXAMPLE CONVERSATIONS**

### **Patient Booking Example:**
```
Patient: !book I need to book a routine checkup
System: ✅ Appointment booking initiated
AI: I can help you book a routine checkup. I have available slots:
     - Tomorrow at 10:00 AM with Dr. Chen
     - Tomorrow at 2:00 PM with Dr. Johnson
     Which would you prefer?

Patient: Book tomorrow at 10 AM
System: ✅ Appointment booked successfully!
```

### **Urgent Appointment Example:**
```
Patient: !urgent I have severe chest pain
System: 🚨 Urgent appointment booking initiated
AI: This sounds urgent. I have an immediate opening today at 2:00 PM 
     with Dr. Chen (Cardiology). Should I book this for you?

Patient: Yes please
System: ✅ Urgent appointment booked!
```

### **Doctor Schedule Example:**
```
Doctor: !quick-login doctor
System: ✅ Demo doctor login successful

Doctor: !schedule today
System: 📅 Today's Schedule:
     - 9:00 AM: Alice Johnson (Routine Checkup)
     - 11:00 AM: Bob Smith (Follow-up)
     - 2:00 PM: Carol Davis (Urgent Consultation)

Doctor: !waitlist
System: 📋 Patient Waitlist:
     1. 🔴 David Wilson - Urgent (Score: 195)
     2. 🟠 Emma Brown - High Priority (Score: 110)
```

---

## **🔐 AUTHENTICATION TRIGGERS**

### **Demo Accounts (Ready to Use):**

#### **Patients:**
```
Email: alice@medschedule.com    Password: patient123
Email: bob@medschedule.com      Password: patient123
Email: carol@medschedule.com    Password: patient123
```

#### **Doctors:**
```
Email: michael@medschedule.com  Password: doctor123
Email: sarah@medschedule.com    Password: doctor123
Email: emily@medschedule.com    Password: doctor123
```

### **Quick Login Examples:**
```
!quick-login patient    # Login as Alice Johnson
!quick-login doctor     # Login as Dr. Michael Chen
```

### **Custom Login Examples:**
```
!login-patient alice@medschedule.com patient123
!login-doctor michael@medschedule.com doctor123
```

---

## **🎯 SPECIAL TRIGGERS**

### **System Commands:**
```
!status    - Check if all systems are online
!test      - Test appointment booking functionality
!help      - Show this guide
!reset     - Reset current session (coming soon)
```

### **Voice Activation:**
You can also use voice commands with the same triggers:
- "Hey bot, book urgent appointment"
- "Hey bot, check availability"
- "Hey bot, show my schedule"

---

## **⚡ ONE-CLICK TRIGGERS**

### **For Quick Actions:**
```
!urgent          - Fastest way to book urgent care
!check today     - Quick availability check
!quick-login     - Instant demo access
!help            - Always available help
```

### **For Doctors:**
```
!waitlist        - See priority patients
!today           - Today's schedule
!slots afternoon - Add afternoon slots
```

---

## **🎮 INTERACTIVE DEMO**

### **Try These Commands Now:**

1. **Start as Patient:**
   ```
   !quick-login patient
   !book routine checkup
   !urgent headache
   !check tomorrow
   ```

2. **Start as Doctor:**
   ```
   !quick-login doctor
   !schedule today
   !waitlist
   !slots tomorrow
   ```

3. **Test System:**
   ```
   !status
   !test
   !help
   ```

---

## **🔧 TECHNICAL DETAILS**

### **Trigger Processing:**
1. System detects trigger command (starts with !)
2. Routes to appropriate handler
3. Processes request with AI/Database
4. Returns response and takes action
5. Updates user session

### **Authentication Flow:**
1. User provides login trigger
2. System validates credentials
3. Generates JWT token
4. Creates user session
5. Enables personalized features

### **Appointment Flow:**
1. User triggers booking command
2. AI analyzes request and intent
3. Checks Google Calendar availability
4. Presents options to user
5. Confirms and books appointment
6. Sends notifications

---

## **🎊 READY TO USE!**

**The trigger system is now fully operational!** 

Simply type any command starting with `!` to activate the corresponding feature. The system will handle everything automatically, from authentication to appointment booking.

**Start with `!quick-login patient` or `!quick-login doctor` to begin!** 🚀
