const chatGuardMiddleware = (req, res, next) => {
  const { message } = req.body;
  if (!message) return next();

  // Strict anti-dating/solicitation regex
  const unsafeRegex = /(cute|date|hangout|sexy|babe|flirt)/i;
  
  if (unsafeRegex.test(message)) {
    return res.status(403).json({ 
      message: 'Message blocked. Our platform strictly prohibits flirting, romantic advances, or non-housing solicitation. Please keep conversations professional.',
      isBlocked: true
    });
  }

  next();
};

module.exports = { chatGuardMiddleware };
