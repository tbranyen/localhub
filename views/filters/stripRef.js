module.exports = function(val) {
  return val.slice('refs/heads/'.length);
};
