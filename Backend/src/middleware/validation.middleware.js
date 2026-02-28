import { body, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Register validation rules
export const registerValidationRules = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 5, max: 30 })
    .withMessage("Name must be between 5 and 30 characters")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["investor", "entrepreneur"])
    .withMessage("Role must be either investor or entrepreneur"),
  validateRequest,
];

// Login validation rules
export const loginValidationRules = [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail()
      .toLowerCase(),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
];

// Collaboration request validation rules
export const collaborationRequestValidationRules = [

  body("investorId").notEmpty().withMessage("Investor ID is required"),
  body("entrepreneurId")
    .notEmpty()
    .withMessage("Entrepreneur ID is required"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 500 })
    .withMessage("Message must be less than 500 characters")
    .escape(),
    validateRequest,
];

// Profile update validation rules
export const profileUpdateValidationRules = [

  body("name")
    .optional()
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage("Name must be between 5 and 30 characters")
    .escape(),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must be less than 500 characters")
    .escape(),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters")
    .escape(),
    validateRequest,
]


// Update password validation rules
export const updatePasswordValidationRules = [
  
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error(
          "New password must be different from current password",
        );
      }
      return true;
    }),
  validateRequest,
];

// Transaction validation rules
export const transactionValidationRules = [

  body("transactionId").notEmpty().withMessage("Transaction ID is required"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters")
    .escape(),
  body("receiverId").if(
    body("type")
      .equals("investorToEntrepreneur")
      .notEmpty()
      .withMessage(
        "Receiver ID is required for investor to entrepreneur transactions",
      ),
  ),
  validateRequest,
];
