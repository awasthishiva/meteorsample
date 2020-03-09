Router.route("/", function() {
  this.render("button");
});
Router.route("/analytics", function() {
  this.render("analytics");
});
Router.route("/list", function() {
  Session.set("page", this.params.page);
  this.render("note");
});
Router.route("/list/:page", function() {
  Session.set("page", this.params.page);
  this.render("note");
});
