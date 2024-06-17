module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //this equivalent to this: next = (err) => next(err)
  };
};
