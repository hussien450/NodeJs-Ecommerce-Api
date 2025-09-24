const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  filterUsersForNonAdmin,
  allowOnlySelfOrAdmin,
  disallowAdminRoleOnCreate,
  maybeUploadUserImage,
} = require("../services/userService");

const authService = require("../services/authService");

const router = express.Router();

// Public create user (cannot create admin role)
router.post(
  "/",
  maybeUploadUserImage,
  resizeImage,
  disallowAdminRoleOnCreate,
  createUserValidator,
  createUser
);

router.use(authService.protect);

router.get("/getMe", getLoggedUserData, getUser);
router.put("/changeMyPassword", updateLoggedUserPassword);
router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUserData);

// List users: admins/managers see all, sellers/users see themselves only
router
  .route("/")
  .get(
    authService.allowedTo("admin", "seller", "user"),
    filterUsersForNonAdmin,
    getUsers
  );

// Allow users/sellers to delete themselves; admins can delete anyone
router.delete(
  "/:id",
  authService.allowedTo("admin", "seller", "user"),
  allowOnlySelfOrAdmin,
  deleteUserValidator,
  deleteUser
);

// Admin
router.use(authService.allowedTo("admin", "seller"));
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
router.route("/");
// POST is handled above as public create

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser);
// delete handled above with allowOnlySelfOrAdmin

module.exports = router;
