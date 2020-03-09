import "./main.html";
import "../lib/routes";
import { Template } from "meteor/templating";
import { Notes } from "../lib/collection";

var Highcharts = require("highcharts");
var moment = require("moment");
var Counts = new Mongo.Collection("counts");
var LineCharts = new Mongo.Collection("linecharts");

Template.note.helpers({
  notes() {
    let page = 0;
    if (Number(Session.get("page")) > 1) {
      page = Number(Session.get("page")) - 1;
    }
    Meteor.subscribe("notes", page * 10, 10);
    return Notes.find();
  }
});

Template.pageSearch.helpers({
  totalPage() {
    Meteor.subscribe("indicatorCount");
    let totalCount = 0;
    if (typeof Counts.findOne({}) !== "undefined") {
      totalCount = Counts.findOne({}).totalCount;
    }
    return totalCount / 10;
  },
  page() {
    let page = 0;
    if (Number(Session.get("page")) > 1) {
      page = Number(Session.get("page")) - 1;
    }
    return page + 1;
  }
});

Template.registerHelper("formatDate", function(date) {
  return date ? moment(date).format("MM-DD-YYYY") : "";
});

Template.analytics.helpers({
  lineChart() {
    Meteor.subscribe("lineChart");
    let i;
    let data = [];
    for (i = 0; i < 12; i++) {
      data[i] = null;
      LineCharts.find().forEach(function(item) {
        if (i + 1 === Number(item.month)) {
          data[i] = item.total;
        }
      });
    }
    Meteor.defer(function() {
      // Create standard Highcharts chart with options:
      Highcharts.chart("lineChart", {
        title: {
          text: "Line Chart"
        },
        xAxis: {
          categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
          ]
        },
        series: [
          {
            data: data
          }
        ]
      });
    });
  },
  createChart: function() {
    Meteor.subscribe("indicatorCount");
    let activeIndicator = 0;
    let inActiveIndicator = 0;
    if (typeof Counts.findOne({}) !== "undefined") {
      activeIndicator = Counts.findOne({}).activeIndicator;
      inActiveIndicator = Counts.findOne({}).inActiveIndicator;
    }

    notesData = [
      {
        y: inActiveIndicator,
        name: "In-Active Indicator"
      },
      {
        y: activeIndicator,
        name: "Active Indicator"
      }
    ];
    // Use Meteor.defer() to craete chart after DOM is ready:
    Meteor.defer(function() {
      // Create standard Highcharts chart with options:
      Highcharts.chart("chart", {
        series: [
          {
            type: "pie",
            data: notesData
          }
        ],
        title: {
          text: "Pi Chart"
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
        },
        accessibility: {
          point: {
            valueSuffix: "%"
          }
        }
      });
    });
  }
});

Template.button.events({
  "click #generate-record": function() {
    event.preventDefault();
    Meteor.call("insertAllNotes");

    return false;
  },
  "click #reset-data": function() {
    event.preventDefault();
    Meteor.call("removeAllNotes");

    return false;
  },
  "click #delete-data": function() {
    event.preventDefault();
    Meteor.call("deleteAllNotes");

    return false;
  },
  "click #expire-data": function() {
    event.preventDefault();
    Meteor.call("expireAllNotes");

    return false;
  },
});

Template.pageSearch.events({
  "submit #pageSearchForm": function() {
    event.preventDefault();
    let page = Number($("#page").val());
    if (Number($("#page").val()) < 1) {
      page = 1;
    }
    Router.go("/list/" + page);

    return false;
  }
});
