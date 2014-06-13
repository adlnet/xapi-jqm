Themes
======

To use different themes, use the [jQuery ThemeRoller](http://themeroller.jquerymobile.com/?ver=1.4.2) or an example from this themes folder.

For example, copy the entire *themes* directory under "greenish" in put it in the CSS folder of your project.

Next, replace the style reference from the CDN loaded theme:

```css
<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.css" />
```

With references to the theme you wish to you.

```css
<link rel="stylesheet" href="css/themes/greenish.min.css" />
<link rel="stylesheet" href="css/themes/jquery.mobile.icons.min.css" />
<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" />
```

Remember, these paths are relative, so if you're working in a "chapter" for example, you'll need to preix ```css``` with ```../```.

Check out [minimal-greenish](../templates/minimal-greenish) to see this theme implemented.
