# Challenges

The first issue was to learn how the Sankey plugin for D3 is actually working.
One thing that troubled us was that sankey is pass by refrence instead of pass by value. This meant that the plugin alteres the data inplace instead of returning a new object.
Further we had problems to figure out how redrawing and things worked to regenerate the Sankey.

But not only the Sankey plugin provided some challenges for us. Also bootstrap and the multiselect plugin generated some challenges. For example, there seems to be only few combinations of bootstrap, jquery and the multiselect tool that worked well together. We weren't able to use the most up to date version of all of them despite we tried many combinations. Since we didn't use the newest version, we didn't have some features available to the multiselect and hence needed to do it ourself (such as the "clear" button).

# Design Decision

Originally, our plan was to give the users of the sankey diagram the full ability to choose from any actor in the database. We soon realized that there are just too many actors in the database and the generation of the select got slow. This impacted the user experience and hence we decided to set a minimum of 15 movies per actor. This threshold can be adapted by the user using a slider.

Similar, we originally wanted to use the whole, original dataset as an input. The drawback was that this method used a lot of resources when the website was loading. This not only impacts the user experience, but also made firefox throw some warnings. While this loading allowed us to develope new features really quickly, it impacted the user too much.
