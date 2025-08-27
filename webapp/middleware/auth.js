module.exports = {
    ensureAuth: (role) => {
      return (req, res, next) => {
        if (!req.session.user) {
          return res.redirect("/login");
        }
        if (role && req.session.user.role !== role) {
          return res.status(403).send("Access Denied");
        }
        next();
      };
    }
  };
  