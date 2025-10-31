# Custom Name Colors and Avatars

## Custom colors

Setting a custom name color for yourself or other Horizon users to see is pretty straight-forward. All you have to do is add the following BBCode somewhere on your character profile:
```bbcode
[color=red]Horizon Color[/color]
```

And, bam! Your custom color is set. You can choose any of the BBCode colors supported on the website:

- ``red``
- ``orange``
- ``yellow``
- ``green``
- ``cyan``
- ``purple``
- ``blue``
- ``pink``
- ``black``
- ``brown``
- ``white``
- ``gray``

> Custom colors only show up when I move my mouse over someone's name, or if they message me, etc!

Right now the custom color system works the same cache system from Rising used for things like the matcher, profile viewer and the filters. One side-effect is that, because this system only loads profile data when it's needed for viewing a profile or matchmaking, it won't automatically display character colours until a relevant interaction has happened. We are looking into reworking the cache system in a Horizon-specific way to account for this, whilst still keeping it as performant as possible.

## Custom High Quality Avatars

Setting a custom high quality avatar for yourself is similarly easy. Just add the following link BBCode to your profile, replacing the url with the link to your own image.
```bbcode
[url=https://static.f-list.net/images/charimage/36573821.gif]Horizon Portrait[/url]
```

For backwards compatability with Rising users, ``Rising Portrait`` is also still supported.


For security reasons, only the following domains are currently whitelisted for support:

- ``static.f-list.net``
- ``static.e621.net``
- ``i.imgur.com`` (album links from imgur.com are not supported, only direct image links).
- ``iili.io`` (album links from freeimage.host are not supported, only direct image links).
- ``redgifs.com``
- ``imgchest.com``
- ``f2.toyhou.se``
