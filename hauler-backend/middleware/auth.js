const admin = require('firebase-admin');

async function checkUserRole(role) {
  return async (req, res, next) => {
    const token = req.headers.authorization.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.role === role) {
        next();
      } else {
        res.status(403).send('Forbidden');
      }
    } catch (error) {
      res.status(401).send('Unauthorized');
    }
  };
}

module.exports = {
  checkUserRole
};