# Employee Leave Management System

A full-stack web application for managing employee leave requests, built with Node.js, Express, MySQL, and vanilla JavaScript.

## 🚀 Live Demo

**Deployed on Railway:** [https://leave-management-production-55dd.up.railway.app](https://leave-management-production-55dd.up.railway.app)

### Test Accounts
- **Manager:** manager@company.com / Admin@123
- **Employee:** john.doe@company.com / Admin@123
- Or register your own account!

---

## Features

- User authentication with JWT
- Role-based access control (Employee, Manager, Admin)
- Leave request submission with automatic working days calculation
- Leave balance tracking per employee
- Manager approval/rejection workflow
- Team calendar view with company holidays
- Real-time leave balance validation
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd employee-leave-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` and set your values:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=leave_management
DB_PORT=3306
JWT_SECRET=your_random_secret_key_here
PORT=3000
```

### 4. Set Up the Database

Create the database and import the schema:

```bash
mysql -u root -p < database/schema.sql
```

Or manually:
1. Open MySQL client: `mysql -u root -p`
2. Run: `source database/schema.sql`

### 5. Generate Password Hashes

After installing dependencies, run this script to set up proper password hashes:

```bash
npm run setup
```

This will update all user passwords in the database with properly hashed versions.

### 6. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Default Login Credentials

### Production (Railway)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | Admin@123 |
| Manager | manager@company.com | Admin@123 |
| Employee | john.doe@company.com | Admin@123 |
| Employee | jane.smith@company.com | Admin@123 |
| Employee | bob.wilson@company.com | Admin@123 |

### Local Development
After running `npm run setup`, use the same credentials as above.

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register new employee | No |
| POST | /api/auth/login | Login user | No |
| GET | /api/auth/me | Get current user profile | Yes |

### Leave Requests
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/leaves | Get all leave requests | Yes |
| POST | /api/leaves | Create leave request | Yes |
| GET | /api/leaves/:id | Get single leave request | Yes |
| PUT | /api/leaves/:id/cancel | Cancel leave request | Yes |

### Admin/Manager
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/admin/pending | Get pending requests | Manager/Admin |
| PUT | /api/admin/review/:id | Approve/reject request | Manager/Admin |
| GET | /api/admin/team | Get team overview | Manager/Admin |

### Balances
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/balances | Get current user balances | Yes |
| GET | /api/balances/:userId | Get specific user balances | Manager/Admin |

### Calendar
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/calendar?month=MM&year=YYYY | Get calendar data | Yes |

## Project Structure

```
employee-leave-management/
├── config/              # Database configuration
├── controllers/         # Business logic
├── database/            # SQL schema and seeds
├── middleware/          # Auth and role middleware
├── routes/              # API route definitions
├── public/              # Frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── *.html          # HTML pages
├── server.js           # Express server entry point
├── package.json        # Dependencies
└── .env                # Environment variables
```

## Key Features Explained

### Working Days Calculation
The system automatically calculates working days by excluding:
- Weekends (Saturday and Sunday)
- Company holidays (from holidays table)

### Leave Balance Validation
Before submitting a leave request, the system:
1. Calculates total working days needed
2. Checks if user has sufficient balance
3. Prevents submission if balance is insufficient

### Manager Workflow
Managers can:
- View all pending requests from direct reports
- Approve or reject with comments
- View team leave balances
- See team calendar

### Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 8-hour expiry
- Role-based access control
- SQL injection prevention with parameterized queries

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use
Change the PORT in `.env` file to a different value (e.g., 3001)

### Token Expired Errors
Tokens expire after 8 hours. Simply log in again to get a new token.

## Deployment

This application is deployed on Railway. For deployment instructions, see:
- `DEPLOYMENT_COMPLETE.md` - Full deployment guide
- `RAILWAY_DEPLOYMENT_FIX.md` - Railway-specific setup

### Quick Deploy to Railway
1. Fork this repository
2. Create a Railway account
3. Create new project from GitHub repo
4. Add MySQL service
5. Set environment variables (JWT_SECRET, MYSQL_URL)
6. Deploy!

## Future Enhancements

- Email notifications for leave approvals/rejections
- Leave request history export (PDF/CSV)
- Multi-level approval workflow
- Leave carry-over automation
- Mobile app version
- Integration with HR systems

## License

MIT License - feel free to use this project for your organization.
