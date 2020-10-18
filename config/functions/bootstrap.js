'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */

module.exports = async () => {
  await changePermission('public', 'application', 'todo', 'count', true);
  await changePermission('public', 'application', 'todo', 'find', true);
  await changePermission('public', 'application', 'todo', 'create', true);
  await changePermission('public', 'application', 'todo', 'findone', true);
  await changePermission('public', 'application', 'todo', 'delete', true);
  await changePermission('public', 'application', 'todo', 'update', true);

  console.log('WAITING 10 seconds to create admin');
  setTimeout(async () => {
    await createAdmin();
  }, 10000);
};

/**
 * Sets strapi permission
 * @param role ex. 'authenticated', 'public'
 * @param permissionType ex. 'application'
 * @param controller ex. 'faqs', 'entries'
 * @param action ex. 'create', 'read', 'update'
 * @param enabled values: true, false
 */
const changePermission = async (
  role,
  permissionType,
  controller,
  action,
  enabled
) => {
  const authenticated = await strapi
    .query('role', 'users-permissions')
    .findOne({ type: role });
  authenticated.permissions.forEach((permission) => {
    if (
      permission.type === permissionType &&
      permission.controller === controller &&
      permission.action === action
    ) {
      permission.enabled = enabled;
      console.log('updated ' + JSON.stringify(permission));
      strapi
        .query('permission', 'users-permissions')
        .update({ id: permission.id }, permission); // Updating Strapi with the permission
    }
  });
};

const createAdmin = async () => {
  // Required fields:
  const params = {
    username: process.env.ADMIN_USER || 'admin',
    password: process.env.ADMIN_PASS || 'admin',
    firstname: process.env.ADMIN_USER || 'Admin',
    lastname: process.env.ADMIN_USER || 'Account',
    email: process.env.ADMIN_EMAIL || 'adam@halopowered.com',
    blocked: false,
    isActive: true,
  };

  // Check if exist any admin account - NOTE: you can change this query to find by specific email
  const admins = await strapi.query('user', 'admin').find({ _limit: 1 });
  if (admins.length) {
    console.error("You can't register a new admin");
  } else {
    try {
      // in the admin under services you can find the super admin role
      const superAdminRole = await strapi.admin.services.role.getSuperAdmin();
      // Hash password before storing in the database
      params.roles = [superAdminRole.id];
      params.password = await strapi.admin.services.auth.hashPassword(
        params.password
      );

      // Create admin account
      const admin = await strapi.query('user', 'admin').create({
        ...params,
      });

      console.info('(Admin) Account created:', admin);
    } catch (error) {
      console.error(error);
    }
  }
};
