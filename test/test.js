'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var format = require('..');
var prettify = format.prettify;

function read(cwd, name) {
  var fp = path.resolve(path.resolve(__dirname, cwd), name + '.md');
  return fs.readFileSync(fp, 'utf8');
}
function fixture(name) {
  return read('fixtures', name);
}
function expected(name) {
  return read('expected', name);
}

describe('module', function() {
  it('should export a function', function() {
    assert.equal(typeof format, 'function');
  });
});

describe('formatting', function() {
  describe('newlines', function() {
    it('should strip leading newlines:', function() {
      assert.equal(prettify('\n\n\nb'), 'b');
    });

    it('should strip trailing newlines:', function() {
      assert.equal(prettify('b\n\n\n'), 'b');
    });

    it('should reduce multiple newlines down to two:', function() {
      assert.equal(prettify('foo\n\n\nbar'), 'foo\n\nbar');
      assert.equal(prettify('a\n\n\nb'), 'a\n\nb');
      assert.equal(prettify('a\n\n\n\n\n\n\nb'), 'a\n\nb');
    });

    it('should format headings to have two newlines before content:', function() {
      assert.equal(prettify('# foo\nbar'), '# foo\n\nbar');
      assert.equal(prettify('## foo\n\n\nbar'), '## foo\n\nbar');
    });

    it('should ensure an extra newline before and after gfm code blocks:', function() {
      var str = 'a\n```js\nvar foo = "bar";\n```\nb';
      assert.equal(prettify(str), 'a\n\n```js\nvar foo = "bar";\n```\n\nb');
    });

    // see: https://github.com/jonschlinkert/pretty-remarkable/issues/1
    it('should properly handle undefined language after code fence:', function() {
      var str = 'a\n```\nvar foo = "bar";\n```\nb';
      assert.equal(prettify(str), 'a\n\n```\nvar foo = "bar";\n```\n\nb');
    });

    it('should remove leading lines inside gfm code blocks:', function() {
      var str = 'a\n```\n\n\n     var foo = "bar";\n```\nb';
      assert.equal(prettify(str), 'a\n\n```\n     var foo = "bar";\n```\n\nb');
    });

    // see: https://github.com/jonschlinkert/pretty-remarkable/issues/2
    it('should not remove leading whitespace on the first gfm code line:', function() {
      var str = 'a\n```\n     var foo = "bar";\n```\nb';
      assert.equal(prettify(str), 'a\n\n```\n     var foo = "bar";\n```\n\nb');
    });
  });

  describe('strong', function() {
    it('should give "section headings" headings two newlines before content:', function() {
      assert.equal(prettify('foo\n**foo**\nbar'), 'foo\n\n**foo**\n\nbar');
      assert.equal(prettify('foo\n\n**foo**\nbar'), 'foo\n\n**foo**\n\nbar');
      assert.equal(prettify('**foo**\nbar'), '**foo**\n\nbar');
      assert.equal(prettify('**foo**\n\n\nbar'), '**foo**\n\nbar');
    });

    it('should not reformat bolded text that is not a heading:', function() {
      assert.equal(prettify('a b c **foo**\nbar'), 'a b c **foo**\nbar');
      assert.equal(prettify('one **two** three\nbar'), 'one **two** three\nbar');
    });
  });

  describe('badges', function() {
    it('should format badges:', function() {
      var str = '[![foo](https://a.b.c.svg)](http://a.b.c)';
      assert.equal(prettify(str), '[![foo](https://a.b.c.svg)](http://a.b.c)');
    });

    it('should use anchors with badges:', function() {
      var str = '[![foo](https://a.b.c.svg)](http://a.b.c){#zzz}';
      assert.equal(prettify(str), '[![foo](https://a.b.c.svg)](http://a.b.c#zzz)');
    });
  });

  describe('images', function() {
    it('should resolve image reflinks:', function() {
      assert.equal(prettify('![foo]\n\n[foo]: bar'), '![foo](bar)');
      assert.equal(prettify('![foo]\n\n[foo]: /url'), '![foo](/url)', 'Should work with absolute url');
      assert.equal(prettify('![foo]\n\n[foo]: /url "some title"'), '![foo](/url "some title")', 'Should work with title');
    });

    it('should resolve image reflinks with anchors:', function() {
      assert.equal(prettify('![foo]\n\n[foo]: bar{#zzz}'), '![foo](bar#zzz)');
      assert.equal(prettify('![foo]{#zzz}\n\n[foo]: /url'), '![foo](/url#zzz)', 'Should work with absolute url');
      assert.equal(prettify('![foo]\n\n[foo]: /url{#zzz}'), '![foo](/url#zzz)', 'Should work with absolute url');
      assert.equal(prettify('![foo]{#zzz}\n\n[foo]: /url "some title"'), '![foo](/url#zzz "some title")', 'Should work with title');
      assert.equal(prettify('![foo]\n\n[foo]: /url{#zzz} "some title"'), '![foo](/url#zzz "some title")', 'Should work with title');
    });
  });

  describe('reference links', function() {
    it('should resolve shortcut reflinks:', function() {
      assert.equal(prettify('[foo]\n\n[foo]: bar'), '[foo](bar)');
      assert.equal(prettify('[foo]\n\n[foo]: /url'), '[foo](/url)', 'Should work with absolute url');
      assert.equal(prettify('[foo]\n\n[foo]: /url "some title"'), '[foo](/url "some title")', 'Should work with title');
    });

    it('should resolve shortcut reflink anchors:', function() {
      assert.equal(prettify('[foo]{#zzz}\n\n[foo]: bar'), '[foo](bar#zzz)');
      assert.equal(prettify('[foo]\n\n[foo]: bar{#zzz}'), '[foo](bar#zzz)');
      assert.equal(prettify('[foo]\n\n[foo]: /url'), '[foo](/url)', 'Should work with absolute url');
      assert.equal(prettify('[foo]{#zzz}\n\n[foo]: /url'), '[foo](/url#zzz)', 'Should work with absolute url');
      assert.equal(prettify('[foo]\n\n[foo]: /url "some title"'), '[foo](/url "some title")', 'Should work with title');
    });

    it('should resolve collapsed reflinks:', function() {
      assert.equal(prettify('[foo][]\n\n[foo]: bar'), '[foo](bar)');
      assert.equal(prettify('[foo][]\n\n[foo]: /url'), '[foo](/url)', 'Should work with absolute url');
      assert.equal(prettify('[foo][]\n\n[foo]: /url "some title"'), '[foo](/url "some title")', 'Should work with title');
    });

    it('should resolve collapsed reflink anchors:', function() {
      assert.equal(prettify('[foo][]\n\n[foo]: bar'), '[foo](bar)');
      assert.equal(prettify('[foo][]{#zzz}\n\n[foo]: bar'), '[foo](bar#zzz)');
      assert.equal(prettify('[foo][]\n\n[foo]: bar{#zzz}'), '[foo](bar#zzz)');
      assert.equal(prettify('[foo][]\n\n[foo]: /url'), '[foo](/url)', 'Should work with absolute url');
      assert.equal(prettify('[foo][]{#zzz}\n\n[foo]: /url'), '[foo](/url#zzz)', 'Should work with absolute url');
      assert.equal(prettify('[foo][]\n\n[foo]: /url{#zzz}'), '[foo](/url#zzz)', 'Should work with absolute url');
      assert.equal(prettify('[foo][]\n\n[foo]: /url "some title"'), '[foo](/url "some title")', 'Should work with title');
      assert.equal(prettify('[foo][]\n\n[foo]: /url{#zzz} "some title"'), '[foo](/url#zzz "some title")', 'Should work with title');
      assert.equal(prettify('[foo][]{#zzz}\n\n[foo]: /url "some title"'), '[foo](/url#zzz "some title")', 'Should work with title');
      assert.equal(prettify('[abc123][]{#zzz}\n\n[abc123]: foo/bar'), '[abc123](foo/bar#zzz)', 'Should work with title');
      assert.equal(prettify('[abc123][]{#zzz}\n\n[abc][]\n\n[abc123]: foo/bar'), '[abc123](foo/bar#zzz)\n\n[abc][]', 'Should work with title');
      assert.equal(prettify('[abc][]\n\n[abc123][]{#zzz}\n\n[abc123]: foo/bar'), '[abc][]\n\n[abc123](foo/bar#zzz)', 'Should work with title');
      assert.equal(prettify('[abc][]\n[abc123][]{#zzz}\n\n[abc123]: foo/bar'), '[abc][]\n\n[abc123](foo/bar#zzz)', 'Should work with title');
      assert.equal(prettify('[ghi]\n[abc][]\n\n[abc123][]{#zzz}\n\n[abc123]: foo/bar'), '[ghi]\n[abc][]\n\n[abc123](foo/bar#zzz)', 'Should work with title');
    });

    it('should resolve full reflinks:', function() {
      assert.equal(prettify('[foo][foo]\n\n[foo]: bar'), '[foo](bar)');
      assert.equal(prettify('[foo][foo]{#zzz}\n\n[foo]: bar'), '[foo](bar#zzz)');
      assert.equal(prettify('[foo][foo]\n\n[foo]: bar{#zzz}'), '[foo](bar#zzz)');
      assert.equal(prettify('[foo][bar]\n\n[bar]: baz'), '[foo](baz)');
      assert.equal(prettify('[foo][foo]\n\n[foo]: /url'), '[foo](/url)', 'Should work with absolute url');
      assert.equal(prettify('[foo][foo]{#zzz}\n\n[foo]: /url'), '[foo](/url#zzz)', 'Should work with absolute url');
      assert.equal(prettify('[foo][foo]\n\n[foo]: /url{#zzz}'), '[foo](/url#zzz)', 'Should work with absolute url');
      assert.equal(prettify('[foo][bar]\n\n[bar]: /url "some title"'), '[foo](/url "some title")', 'Should work with title');
      assert.equal(prettify('[foo][foo]\n\n[foo]: /url'), '[foo](/url)', 'Should work with absolute url');
      assert.equal(prettify('[foo][bar]\n\n[bar]: /url "some title"'), '[foo](/url "some title")', 'Should work with title');
    });
  });

  describe('reference links context', function() {
    it('should resolve shortcut reflinks from the context', function() {
      var opts = { context: {reflinks: {foo: 'bar'}}}
      assert.equal(prettify('[foo] whatever', opts), '[foo](bar) whatever');
    });

    it('should resolve shortcut reflinks with anchors from the context', function() {
      var opts = { context: {reflinks: {foo: 'bar'}}}
      assert.equal(prettify('[foo]{#zzz} whatever', opts), '[foo](bar#zzz) whatever');
    });

    it('should resolve collapsed reflinks from the context', function() {
      var opts = { context: {reflinks: {foo: 'bar'}}}
      assert.equal(prettify('[foo][] whatever', opts), '[foo](bar) whatever');
      assert.equal(prettify('[foo][]{#zzz} whatever', opts), '[foo](bar#zzz) whatever');
    });
  });

  describe('links', function() {
    it('should format links:', function() {
      var str = '[foo](https://a.b.c.svg)';
      assert.equal(prettify(str), '[foo](https://a.b.c.svg)');
    });

    it('should format link anchors:', function() {
      var str = '[foo](https://a.b.c.svg){#zzz}';
      assert.equal(prettify(str), '[foo](https://a.b.c.svg#zzz)');
    });

    it('should format link anchors with text:', function() {
      var str = '[jkl](mno "this is text"){#foo}';
      assert.equal(prettify(str), '[jkl](mno#foo "this is text")');
    });

    it('should format image links:', function() {
      var str = '[![foo](https://a.b.c.svg)](http://a.b.c)';
      assert.equal(prettify(str), '[![foo](https://a.b.c.svg)](http://a.b.c)');
    });

    it('should format image links with titles:', function() {
      var str = '[![foo](https://a.b.c.svg "this is a title")](http://a.b.c)';
      assert.equal(prettify(str), '[![foo](https://a.b.c.svg "this is a title")](http://a.b.c)');
    });

    it('should format image link anchors:', function() {
      var str = '[![foo](https://a.b.c.svg)](http://a.b.c){#zzz}';
      assert.equal(prettify(str), '[![foo](https://a.b.c.svg)](http://a.b.c#zzz)');
    });

    it('should append anchors to image link urls', function() {
      assert.equal(prettify('[![foo](https://a.b.c.svg)](http://a.b.c){#zzz}'), '[![foo](https://a.b.c.svg)](http://a.b.c#zzz)');
      assert.equal(prettify('[![foo](bar)](baz){#zzz}'), '[![foo](bar)](baz#zzz)');
    });
  });

  describe('lists', function() {
    it('should format unordered lists:', function() {
      assert.equal(prettify(fixture('ul')), expected('ul'));
    });

    it('should format ordered lists:', function() {
      assert.equal(prettify(fixture('ol')), expected('ol'));
    });
  });

  describe('tables', function() {
    it('should format tables:', function() {
      assert.equal(prettify(fixture('table')), expected('table'));
    });
  });
});