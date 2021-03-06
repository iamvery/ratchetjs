var {expect} = require('./helper');

describe('transformation', () => {
  var {apply, transform} = require('../lib/jank/transformer');
  var {Attribute, Node, Text, Comment} = require('./support/dom');

  describe('apply', () => {
    it('applies text data to node directly', () => {
      var node = new Node('div');

      var {tag, props, content} = apply(node, 'lolwat');

      expect(tag).to.eql('div');
      expect(props).to.eql({});
      expect(content).to.eql(['lolwat']);
    });

    it('applies numeric data to node directly', () => {
      var node = new Node('div');

      var {tag, props, content} = apply(node, 123);

      expect(tag).to.eql('div');
      expect(props).to.eql({});
      expect(content).to.eql([123]);
    });

    it('applies normalized attributes data to node properties', () => {
      var child = new Node('span');
      var node = new Node('div', [], [child]);

      var {tag, props, content} = apply(node, {_attrs_: true, class: 'wat'});

      expect(tag).to.eql('div');
      expect(props).to.eql({className: 'wat'});
      expect(content[0].tag).to.eql('span');
    });

    it('applies combination text content and attribute data to node', () => {
      var node = new Node('div');

      var {tag, props, content} = apply(node, {_content_: 'foo', _attrs_: {_attrs_: true, lol: 'wat'}});

      expect(tag).to.eql('div');
      expect(props).to.eql({lol: 'wat'});
      expect(content).to.eql(['foo']);
    });

    it('applies combination data recursively', () => {
      var attr = new Attribute('data-prop', 'wat');
      var child = new Node('div', [attr])
      var node = new Node('div', [], [child]);

      var {tag, props, content} = apply(node, {_content_: {wat: 'haha'}, _attrs_: {_attrs_: true, lol: 'wat'}});
      expect(tag).to.eql('div');
      expect(props).to.eql({lol: 'wat'});
      expect(content[0].tag).to.eql('div');
      expect(content[0].content).to.eql(['haha']);
    });

    it('applies array data by mapping over node', () => {
      var node = new Node('article');

      var {tag, props, content} = apply(node, ['lol', 'wat']);
      var [first, last] = content;

      expect(tag).to.eql('div');
      expect(props).to.eql({});
      expect(first.tag).to.eql('article');
      expect(first.props).to.eql({});
      expect(first.content).to.eql(['lol']);
      expect(last.tag).to.eql('article');
      expect(last.props).to.eql({});
      expect(last.content).to.eql(['wat']);
    });

    it('applies other data by recursively creating children', () => {
      var attr = new Attribute('data-prop', 'wat');
      var child = new Node('div', [attr]);
      var node = new Node('div', [], [child]);

      var {tag, props, content} = apply(node, {wat: 'hahaha'});

      expect(tag).to.eql('div');
      expect(props).to.eql({});
      expect(content[0].tag).to.eql('div');
      expect(content[0].props).to.eql({'data-prop': 'wat'});
      expect(content[0].content).to.eql(['hahaha']);
    });

    it('applies combination content and attributes by recursively creating children and updating node props', () => {
      var attr = new Attribute('data-prop', 'wat');
      var child = new Node('div', [attr]);
      var node = new Node('div', [], [child]);

      var {tag, props, content} = apply(node, {_content_: {wat: 'hahaha'}, _attrs_: {_attrs_: true, lol: 'wat'}});

      expect(tag).to.eql('div');
      expect(props).to.eql({lol: 'wat'});
      expect(content[0].tag).to.eql('div');
      expect(content[0].props).to.eql({'data-prop': 'wat'});
      expect(content[0].content).to.eql(['hahaha']);
    });
  });

  describe('transform', () => {
    context('node is text', () => {
      it('returns text when node is text', () => {
        var node = new Text('foo');

        var result = transform(node);

        expect(result).to.equal('foo');
      });
    });

    context('node is comment', () => {
      it('returns nothing', () => {
        var node = new Comment();

        var result = transform(node);

        expect(result).to.equal(null);
      });
    });

    context('node is scoped', () => {
      it('applies text content to element', () => {
        var attr = new Attribute('data-prop', 'lol');
        var node = new Node('div', [attr]);
        var data = {lol: 'wat'};

        var {tag, props, content} = transform(node, data);

        expect(tag).to.equal('div')
        expect(props).to.eql({'data-prop': 'lol'});
        expect(content).to.eql(['wat']);
      });
    });

    context('node is not scoped', () => {
      it('recursively transforms elements with data', () => {
        var chattr = new Attribute('data-prop', 'wat');
        var child = new Node('div', [chattr]);
        var node = new Node('div', [], [child]);
        var data = {wat: 'hahaha'};

        var {tag, props, content} = transform(node, data);

        expect(tag).to.equal('div')
        expect(props).to.eql({});
        expect(content[0].tag).to.equal('div');
        expect(content[0].props).to.eql({'data-prop': 'wat'});
        expect(content[0].content).to.eql(['hahaha']);
      });
    });
  });
});
