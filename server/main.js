import { Meteor } from "meteor/meteor";
import { Notes } from "../lib/collection";
import { Promise } from "meteor/promise";

Meteor.startup(() => {
  // code to run on server at startup
  return Meteor.methods({
    removeAllNotes: function() {
      return Notes.remove({});
    },
    deleteAllNotes: function() {
      return Notes.update(
        {},
        { $set: { ActiveIndicator: "N", ExpiryDate: new Date() } },
        { multi: true }
      );
    },
    expireAllNotes: function() {
      return Notes.update(
        { ExpiryDate: null },
        { $set: { ExpiryDate: new Date() } },
        { multi: true }
      );
    },
    expireAllNotes: function() {
      return Notes.update(
        { ExpiryDate: null },
        { $set: { ExpiryDate: new Date() } },
        { multi: true }
      );
    },
    insertAllNotes: function() {
      let i;
      for (i = 1; i <= 10000; i++) {
        Notes.insert({
          C1: "C1_" + i,
          C2: "C2_" + i,
          C3: "C3_" + i,
          C4: "C4_" + i,
          C5: "C5_" + i,
          C6: "C6_" + i,
          C7: "C7_" + i,
          C8: "C8_" + i,
          C9: "C9_" + i,
          C10: "C10_" + i,
          ActiveIndicator: "Y",
          EffectiveDate: new Date(),
          ExpiryDate: null
        });
      }

      return false;
    }
  });
});

Meteor.publish("notes", function(skip = 10, limit = 10) {
  return Notes.find({}, { skip, limit });
});

Meteor.publish("indicatorCount", function() {
  let subscription = this;
  let inActiveIndicator = Notes.find({ ActiveIndicator: "N" }).count();
  let totalCount = Notes.find({}).count();
  let activeIndicator = totalCount - inActiveIndicator;
  let countObject = {};
  countObject.totalCount = totalCount;
  countObject.activeIndicator = activeIndicator;
  countObject.inActiveIndicator = inActiveIndicator;
  countObject.type = "notes";
  subscription.added("counts", 1, countObject);
  subscription.ready();
});

Meteor.publish("lineChart", function() {
  let subscription = this;
  const lineChart = Promise.await(
    Notes.rawCollection()
      .aggregate([
        { $match: { ActiveIndicator: "Y" } },
        {
          $group: {
            _id: {
              month: { $month: "$EffectiveDate" },
              year: { $year: "$EffectiveDate" }
            },
            total: { $sum: 1 }
          }
        }
      ])
      .toArray()
  );
  i = 1;
  lineChart.forEach(function(location) {
    subscription.added("linecharts", i, {
      month: location._id.month,
      year: location._id.year,
      total: location.total
    });
    i++;
  });
  subscription.ready();
});
