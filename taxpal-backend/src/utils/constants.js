const UserRole = {
  ADMIN: 'Admin',
  HR: 'HR',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
};

const EmployeeStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  TERMINATED: 'Terminated',
};

const PaymentStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  PAID: 'Paid',
  REJECTED: 'Rejected',
};

module.exports = {
  UserRole,
  EmployeeStatus,
  PaymentStatus,
  ROLES: Object.values(UserRole),
  EMPLOYEE_STATUSES: Object.values(EmployeeStatus),
  PAYMENT_STATUSES: Object.values(PaymentStatus),
};
