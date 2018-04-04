var TOKEN = 'c18db18a8ee0f153f4fb6cd53e86d9abed9800fd';
var PAGE_SIZE = 100;
var HIGH_SCORE_SIZE = 10;

$(function() {
  getReactionData(renderReactionData);
});

function getReactionData(cb) {
  getDataRecursive('repos/adaptlearning/adapt_authoring/issues', function(issueData) {
    cb(issueData.sort(function(a, b) {
      var aCumulative = a.reactions['+1'] - a.reactions['-1'];
      var bCumulative = b.reactions['+1'] - b.reactions['-1'];
      if(aCumulative < bCumulative) return 1;
      if(aCumulative > bCumulative) return -1;
      return 0;
    }).slice(0,HIGH_SCORE_SIZE));
  });
}

function getDataRecursive(urlSuffix, data, dataType, memo, callback) {
  if(typeof data === 'function') {
    callback = data;
    data = {};
    dataType = undefined;
    memo = [];
  }
  var page = Math.ceil(memo.length/PAGE_SIZE)+1;
  $.ajax({
    url: 'https://api.github.com/' + urlSuffix,
    type: 'GET',
    data: _.extend({ per_page: PAGE_SIZE, page: page }, data),
    dataType: dataType,
    headers: {
      Accept: 'application/vnd.github.squirrel-girl-preview+json',
      Authorization: 'token ' + TOKEN
    },
    success: function(results) {
      callback(memo.concat(results));
      /*
      if(results.length) {
        memo = memo.concat(results);
        getDataRecursive(urlSuffix, data, dataType, memo, callback);
      } else {
        callback(memo);
      }
      */
    },
    error: function(jqXHR) {
      var error;
      if(jqXHR.responseJSON) {
        error = jqXHR.responseJSON.message + '\n' + jqXHR.responseJSON.documentation_url;
      }
      else if(jqXHR.statusText) {
        error = jqXHR.statusText;
      }
      throw new Error(error);
    }
  });
}

function renderReactionData(issueData) {
  var $el = $('.issues');
  $el.empty();
  for(var i = 0, count = issueData.length; i < count; i++) {
    issueData[i].count = i+1;
    $el.append(getIssueHTML(issueData[i]));
  }
}

function getIssueHTML(data) {
  // TODO find a better way to do this
  var labelsHtml = '';
  for(var i = 0, count = data.labels.length; i < count; i++) {
    labelsHtml += _.template('<div class="label"><%- name %></div>')(data.labels[i]);
  }
  return _.template(
    '<div class="issue">' +
      '<div class="count"><%- count %>.</div>' +
      '<div class="inner">' +
        '<div class="reactions">' +
          '<div class="reaction positive">+<%- reactions["+1"] %></div>' +
          '<div class="reaction negative">-<%- reactions["-1"] %></div>' +
        '</div>' +
        '<div class="number"><a href="<%- html_url %>" target="_blank">#<%- number %></a></div>' +
        '<div class="title"><%- title %></div>' +
        '<div class="labels">' + labelsHtml + '</div>' +
      '</div>' +
    '</div>'
  )(data);
}
