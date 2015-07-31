var React = require('React');
var Bacon = require('baconjs');
var pegasus = require('@typicode/pegasus');
var _ = require('lodash');

require('../css/spinner.css');
require('../css/widget.css');


var Widget = React.createClass({
  displayName: 'weather-widget',

  getDefaultProps: function () {
    return {
      id: 'weather-widget',
      unit: '°',
      queryUrl: 'http://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20location%3D%2222102%22&amp;&format=json'
    }
  },

  getInitialState: function () {
    return {
      city: '',
      temp: '',
      description: '',
      img: '',
      forecast: [],

      loading: true,
      error: false
    };
  },

  _transformData: function (data) {

    var json = data.query.results.channel.item;

    return {
      //Extract city
      city: json.title.replace(/^Conditions for (.*) at .*$/, '$1'),
      temp: json.condition.temp,
      description: json.condition.text,
      //Extract img url
      imgSrc: json.description.replace(/^[\s\S]*<img src="(http[^"]+?)"[\s\S]*$/, '$1'),
      forecast: json.forecast
    };
  },

  _spinner: function () {
    return (
      <div id={this.props.id}>
        <div className = 'spinner'/>
      </div>
      );
  },

  _error: function () {
    return (
      <div id={this.props.id}>
        <div className = 'row'>
          <div className = 'errorTitle'>
          Something bad happened.
          </div>
        </div>
        <div className = 'row'>
          <div className = 'error'>
          Really bad. Like the zombie apocalypse.
          Or skynet. Or maybe Yahoo is having a bad day...
            <i>Yeah, that's it (nervous laughter).</i>
          </div>
        </div>
      </div>
      )
  },

  _widget: function () {
    var unit = this.props.unit;

    return (
      <div id={this.props.id}>
        <div className='row'>
          <div className='city'>{this.state.city}</div>
        </div>
        <div className='row'>
          <div className='column'>
            <div className='temp'>{this.state.temp + unit}</div>
          </div>
          <div className='column'>
            <div className='img'>
              <img src={this.state.imgSrc}></img>
            </div>
            <div className='description'>{this.state.description}</div>
          </div>
        </div>
        <div className='row'>
          <ul className='forecast'>
          {this.state.forecast.map(function (data, i) {
            return (
              <li key={i}>
                <div className='day'>{data.day}</div>
                <div className='dayForecast'>{data.high + unit}/{data.low + unit}</div>
              </li>
              );
          })}
          </ul>
        </div>
      </div>
      );
  },

  componentWillMount: function () {
    var that = this;

    var ajax = Bacon.retry({
      source: function () {
        return Bacon.fromPromise(pegasus(that.props.queryUrl));
      },
      retries: 5,
      delay: function () {
        return 100;
      }
    });

    this.unsub = ajax
      .map(this._transformData)
      .onValue(function (state) {
        that.setState(_.assign(state, {loading: false}));
      });

    this.unsubError = ajax.onError(function() {
      that.setState({loading:false, error:true});
    });
  },

  render: function () {
    return this.state.loading ?
      this._spinner() :
      this.state.error ?
        this._error() :
        this._widget();
  },

  componentWillUnmount: function () {
    //Need to unsubscribe listeners otherwise memory leak
    this.unsub();
    this.unsubError();
  }
});

module.exports = Widget;

