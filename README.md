# Crab_Grabber_Website

Crab Grabber Website Plan

Phase 1 — Define Purpose (Foundation)

Clarify what the website must do.

Minimum core goals
	1.	Show menu
	2.	Show location and hours
	3.	Allow customers to join waitlist (QR scan)
	4.	Allow customers to contact restaurant
	5.	Mobile-friendly design

Optional advanced goals
	6.	Online ordering
	7.	Table reservation
	8.	SMS notifications (waitlist ready)
	9.	Admin dashboard
	10.	Analytics (customer visits, popular dishes)

⸻

Phase 2 — Website Pages Structure

Recommended pages:

/
├── Home
├── Menu
├── Waitlist
├── About
├── Contact
└── Admin (private)


⸻

Phase 3 — Core Features Breakdown

1. Home Page

Purpose: first impression

Include:
	•	Restaurant logo
	•	Hero image
	•	Short description
	•	“Join Waitlist” button
	•	“View Menu” button
	•	Location + hours

Example layout:

[ Logo ]

[ Big seafood image ]

Crab Grabber
Fresh Seafood • Live Crab • Cajun Boil

[ Join Waitlist ]
[ View Menu ]

Open today: 11am – 10pm


⸻

2. Menu Page

Structure:

Categories:
- Live Crab
- Shrimp
- Lobster
- Combo
- Drinks

Each item:

Name
Price
Image
Description


⸻

3. Waitlist Page (Critical Feature)

This is your main business tool.

Customer enters:

Name
Party size
Phone number

Press:

Join Waitlist

Server stores:

{
  id,
  name,
  phone,
  partySize,
  status,
  time
}


⸻

4. QR Code Integration

Customer scans QR code at restaurant entrance.

QR code points to:

https://crabgrabber.com/waitlist

Customer joins waitlist without staff help.

⸻

5. SMS Notification System

When table ready:

Admin clicks:

Notify Customer

Customer receives SMS:

Crab Grabber: Your table is ready. Please come to front desk.


⸻

Phase 4 — Technology Stack Recommendation

Since you already use:
	•	Node.js
	•	EC2
	•	Nginx

Recommended stack:

Frontend

Simple and fast:

Option A (recommended)

HTML
CSS
JavaScript

Option B (advanced)

React


⸻

Backend

Use your existing system:

Node.js
Express


⸻

Database

Start simple:

SQLite

Upgrade later:

PostgreSQL


⸻

SMS service

Use:

Twilio

Industry standard.

⸻

Phase 5 — System Architecture

Customer Phone
      ↓
Website (Frontend)
      ↓
Node.js Server
      ↓
Database

Admin Panel
      ↓
Send SMS via Twilio


⸻

Phase 6 — Domain and Deployment

Example:

crabgrabber.com

Host on your EC2 (same as learnwise API)

Nginx config example:

crabgrabber.com → frontend
api.crabgrabber.com → backend


⸻

Phase 7 — Minimum Viable Product (MVP)

Build in this order:

Step 1:
Home page

Step 2:
Menu page

Step 3:
Waitlist page

Step 4:
Backend API

Step 5:
Admin page

Step 6:
SMS integration

⸻

Phase 8 — Future Expansion

Possible upgrades:
	•	Online ordering
	•	Payment
	•	Table reservation calendar
	•	Kitchen dashboard
	•	Customer accounts
	•	Loyalty system

⸻

Recommended Development Timeline

Realistic timeline for one developer:

Day 1–2: Frontend pages
Day 3–4: Backend API
Day 5: Waitlist system
Day 6: Admin dashboard
Day 7: SMS integration
Day 8: Deployment


⸻

Next Step

Choose one to start:

Option A:
Design UI structure

Option B:
Build backend waitlist API

Option C:
Build full architecture diagram specific to your EC2 server

Option D:
Generate production-ready starter project structure
