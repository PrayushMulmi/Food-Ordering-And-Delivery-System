export function login(req, res) {
  res.json({ success: true, message: "Login endpoint ready.", user: req.body });
}

export function register(req, res) {
  res.status(201).json({ success: true, message: "Register endpoint ready.", user: req.body });
}
