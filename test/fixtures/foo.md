## Usage

```js
var gulp = require('gulp');
var format = require('{%= name %}');

gulp.task('format-md', function () {
  return gulp.src('readme.md')
    .pipe(format())
    .pipe(gulp.dest('.'));
});
```

## Options

### force

Force `gulp-format-md` to format files with non-markdown extensions.

**type**: `boolean`

**default**: `undefined`

**example**

```js
gulp.task('format-md', function () {
  return gulp.src('foo.txt')
    .pipe(format({force: true}))
    .pipe(gulp.dest('.'));
});
```

### newline

`gulp-format-md` ensures that files have a trailing newline by default. Pass `false` to disable this and strip trailing whitespace.

**type**: `boolean`

**default**: `true`

**example**

```js
gulp.task('format-md', function () {
  return gulp.src('readme.md')
    .pipe(format({newline: false}))
    .pipe(gulp.dest('.'));
});
```