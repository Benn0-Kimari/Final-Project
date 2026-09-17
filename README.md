# IT HelpDesk Management System

A web-based IT fault reporting and ticket tracking prototype.

## Current working flow

Home → Register → Login → Employee Dashboard → Report Fault → My Tickets

## Current features

- Employee registration
- Employee login/logout
- Protected employee pages
- Fault/ticket submission
- Ticket ID generation
- Ticket status tracking
- Dashboard ticket statistics
- My Tickets page
- Responsive interface
- Local browser storage for prototype testing

## Important

The current version uses `localStorage` only for prototype testing.
For the final project, Firebase Authentication and Firestore should
replace local storage so that accounts and tickets are securely stored
and shared between users, technicians, and administrators.

## Run

Open the `Final-Project` folder in VS Code and start Live Server from
`index.html`. Then visit:

http://127.0.0.1:5500/

## Test

1. Click Report a Problem.
2. Create an account.
3. Sign in with the same credentials.
4. Open Report Fault.
5. Submit a ticket.
6. Open My Tickets.
7. Return to Dashboard and confirm the ticket statistics changed.
