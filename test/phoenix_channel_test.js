var {expect} = require('./helper');

describe('Phoenix adapter', () => {
  var FakePhoenixChannel = require('./support/fake_phoenix_channel');
  var PhoenixAdapter = require('../lib/ratchet/adapters/phoenix');
  var channel, adapter;

  beforeEach(() => {
    channel = new FakePhoenixChannel();
    adapter = new PhoenixAdapter(channel);
  });

  describe('#data', () => {
    it('registers a callback to be invoked when data happens', (done) => {
      var data = {};

      adapter.data((payload) => {
        expect(payload).to.equal(data);
        done();
      });

      channel.synthesize(data);
    });
  });
});
