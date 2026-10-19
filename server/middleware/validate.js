const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessages,
        errors: parsed.error.issues
      });
    }
    req.body = parsed.data;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Validation failed'
    });
  }
};

module.exports = validate;
