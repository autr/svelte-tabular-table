Svelte Tabular Table
====================

Fully-featured, no-BS, lightweight table component for Svelte.

    pnpm i svelte-tabular-table

*   [Live Examples](https://autr.github.io/svelte-tabular-table)
*   [Example 1 - Basic](#example-1---basic)
*   [Example 2 - Dimensions](#example-2---dimensions)
*   [Example 3 - Sortable](#example-3---sortable)
*   [Example 4 - Checkable](#example-4---checkable)
*   [Example 5 - Rearrangeable](#example-5---rearrangeable)
*   [Example 6 - Autohide (1)](#example-6---autohide-1)
*   [Example 7 - Autohide (2)](#example-7---autohide-2)
*   [Example 8 - Callbacks](#example-8---callbacks)
*   [Example 9 - Components](#example-9---components)
*   [Example 10 - Classes](#example-10---classes)
*   [API Documentation](#api-documentation)

### [Example 1 - Basic](https://autr.github.io/svelte-tabular-table#basic)

Basic configuration:

*   `init.data` - an array of objects comprising the rows
*   `init.keys` - an array of keys to define columns
*   `init.index` - the key used for indexing each row \*
*   `init.nohead` - a boolean to remove thead
*   `init.nodiv` - a boolean to render without div \*\*

\* If no valid `init.index` is set, or if there are duplicate values inside data, the table will attempt to generate unique keys.  
\*\* Enabling this means `dimensions` and `features.autohide` will not work.

```svelte

    <script>
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            keys: ['name', 'balance', 'address', 'company'],
            index: '_id',
            name: 'basic-example',
            nohead: false,
            nodiv: false,
            data
        }
    }
    </script>
    <Table {...config} />

```

### [Example 2 - Dimensions](https://autr.github.io/svelte-tabular-table#dimensions)

Dimensions control the formatting of the table:

*   `dimensions.row` - sets row height and cuts overflowing cells with an ellipsis (`...`)
*   `dimensions.padding` - sets cell padding
*   `dimensions.widths` - sets an array of widths for each column (can be int or string "10em", "50%", etc)
*   `dimensions.minwidth` - minimum width of table (int or string)

When using `features.autohide` it is important to set dimensions, so that each row is a consistent height.

```svelte

    <script>
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            keys: ['age', 'latitude', 'longitude', 'name', 'about'],
            index: '_id',
            data
        },
        dimensions: {
            name: 'dimensions-example',
            row: 16,
            padding: 10,
            widths: [50,100,100,150],
            minwidth: 400
        }
    }
    </script>
    <Table {...config} />

```

### [Example 3 - Sortable](https://autr.github.io/svelte-tabular-table#sortable)

Sortable headers can be initialised by setting `features.sortable.key` to an initial value and `features.sortable.direction` to `true (ascending)` or `false (descending)`.

```svelte

    <script>
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            name: 'sortable-example',
            keys: ['name', 'balance', 'company', 'latitude', 'longitude', 'tags'],
            index: '_id',
            data
        },
        features: {
            sortable: {
                key: 'name'
            }
        }
    }
    </script>
    <Table {...config} />

```

### [Example 4 - Checkable](https://autr.github.io/svelte-tabular-table#checkable)

Checkable rows are initialised by passing a blank `{}` object to `features.checkable`, which will be set via `init.index`.

```svelte
    <script>
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            name: 'checkable-example',
            keys,
            index: '_id',
            data
        },
        dimensions: {
            widths: [ 100 ]
        },
        features: {
            checkable: {}
        }
    }
    </script>
    <Table {...config} />

```

### [Example 5 - Rearrangeable](https://autr.github.io/svelte-tabular-table#rearrangeable)

Rearrangeable rows are initialised by passing a callback function to `features.rearrangeable`, which will return the _from_ and _to_ indexes as an integer: `( from, to ) => ...`

```svelte

    <script>
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            name: 'rearrangeable-example',
            keys: ['name', 'balance', 'company'],
            index: '_id',
            data
        },
        features: {
            rearrangeable: (from, to) => alert(`from ${from} to ${to}`)
        }
    }
    </script>
    <Table {...config} />

```
### [Example 6 - Autohide (1)](https://autr.github.io/svelte-tabular-table#autohide-1)

Autohide will stop rows that are currently not in view from rendering - increasing performance on tables with large datasets or images and video. It can be used inside a container, or with the window element - and must be manually triggered via `features.autohide.position`:

*   `features.autohide.container` - sets the scrolling parent element and enables autohide
*   `features.autohide.position` - is the current scrollTop / scrollY position, and must be manually updated from your own `on:scroll` event
*   `features.autohide.buffer` - sets extra space before rows are hidden as a multiple of `container.offsetHeight` (ie. 0.5 \* 400 = 200px buffer)

Example is using `window` as container with **`buffer` set to minus `-0.1` to illustrate limits of hidden row edges**:

```svelte

    <script>
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            name: 'autohide-1-example',
            keys,
            index: '_id',
            data: many,
            nohead: true
        },
        dimensions: {
            row: 16
        },
        features: {
            autohide: {
                container: window,
                position: scrollY, // <svelte:window on:scroll={ e => scrollY = window.scrollY } />
                buffer: -0.1
            }
        }
    }
    </script>
    <Table {...config} />

```
### [Example 7 - Autohide (2)](https://autr.github.io/svelte-tabular-table#autohide-2)

Example using a _container_, see [Autohide (1)](#autohide-1):

```svelte

    <script>
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            name: 'autohide-2-example',
            keys,
            index: '_id',
            data: many,
            nohead: true
        },
        dimensions: {
            row: 16
        },
        features: {
            autohide: {
                container: container, // bind:this={ container }
                position: scrollY, // on:scroll={ e => scrollY = window.scrollY }
                buffer: 2
            }
        }
    }
    </script>
    <Table {...config} />
    
```

### [Example 8 - Callbacks](https://autr.github.io/svelte-tabular-table#callbacks)

Callbacks can be defined for:

*   `callbacks.render.cell` or `callbacks.render.key` - returning with `{id, item, key, value, rowIndex, cellIndex}` argument \*
*   `callbacks.click.cell` or `callbacks.click.key` - returning with `{id, item, key, value, rowIndex, cellIndex, _event_}` argument

\* Render callback can also be a component reference (see [Example 9 - Components](#components)):

```svelte

    <script>
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            name: 'callbacks-example',
            keys: ['name', 'balance', 'company', 'latitude', 'longitude'],
            index: '_id',
            data
        },
        callbacks: {
            render: {
                cell: o => ['🌱','☘️','🥬','🌿','🥒'][o.cellIndex] ,
                key: o => ['🌴','🌲','🌳','🏔','🥦'][o.cellIndex],
            },
            click: {
                cell: o => alert( ['🌴','🌲','🌳','🏔','🥦'][o.cellIndex] ) ,
                key: o => alert( ['🌱','☘️','🥬','🌿','🥒'][o.cellIndex] ),
            }
        }
    }
    </script>
    <Table {...config} />
    
```

### [Example 9 - Components](https://autr.github.io/svelte-tabular-table#components)

In place of a callback render function, a `svelte:component` can be used with the properties `{id, item, key, value, index}`:

```svelte

    <script>
    import Auto from './Auto.svelte'
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            name: 'components-example',
            keys: ['picture', 'name', 'latitude', 'longitude', 'registered', 'about'],
            index: '_id',
            data
        },
        callbacks: {
            render: {
                cell: Auto,
                key: Auto,
            }
        },
    }
    </script>
    <Table {...config} />
    
    // --- Auto.svelte ---
    
    <script>
        export let id
        export let item
        export let key
        export let value
        export let index
        export let type
    </script>
    
    {#if type == 'key'}
        <b style="letter-spacing: 0.2em">{value}</b>
    {:else if (key == 'picture')}
        <img src={ value } />
    {:else if (key == 'registered')}
        <em>{ ( new Date( value ) ).toDateString() }</em>
    {:else if (key == 'about')}
        <marquee>{value}</marquee>
    {:else if (key == 'name')}
        <blink style="color:rgb(255,62,0)">{value}</blink>
    {:else if (key == 'latitude' || key =='longitude' )}
        <code>{value}</code>
    {:else}
        {value}
    {/if}
    
```

### [Example 10 - Classes](https://autr.github.io/svelte-tabular-table#classes)

The classes object is a list of classes that are applied to a row based on it's `id`.  
In this example we are setting an orange and yellow background class when a cell item is clicked:

```svelte

    <script>
    import Auto from './Auto.svelte'
    import { Table } from 'svelte-tabular-table'
    const config = {
        init: {
            name: 'classes-example',
            keys: ['name', 'balance', 'company', 'latitude', 'longitude', 'tags'],
            index: '_id',
            data
        },
        classes: {
            orange_background: [ selected ],
            yellow_background: clicked
    
        },
        callbacks: {
            click: {
                cell: o => {
                selected = o.id
                clicked.push( o.id )
                }
            }
        }
            
    }
    </script>
    <Table {...config} />
    
    // --- Auto.svelte ---
    
    <script>
        export let id
        export let item
        export let key
        export let value
        export let index
        export let type
    </script>
    
    {#if type == 'key'}
        <b style="letter-spacing: 0.2em">{value}</b>
    {:else if (key == 'picture')}
        <img src={ value } />
    {:else if (key == 'registered')}
        <em>{ ( new Date( value ) ).toDateString() }</em>
    {:else if (key == 'about')}
        <marquee>{value}</marquee>
    {:else if (key == 'name')}
        <blink style="color:rgb(255,62,0)">{value}</blink>
    {:else if (key == 'latitude' || key =='longitude' )}
        <code>{value}</code>
    {:else}
        {value}
    {/if}
```
API Documentation
=================

Properties are categorised:

*   `init` - for data and setup
*   `dimensions` - formatting sizes, widths, heights
*   `features` - sortable, checkable, rearrangeable, autohide
*   `callbacks` - cell rendering and events

    import { Table } from 'svelte-tabular-table'
    <Table {init} {dimensions} {features} {callbacks} {id} {class} {style} {debug} />

| Name | Description | Types | Default | Example |
| --- | --- | --- | --- | --- |
| init.data | list of rows | Array:Object | null | \[{ color: 'blue', id: '001' }\] |
| init.keys | list of columns | Array:String | null | \[ 'color', 'id' \] |
| init.index | unique index | String | null | id |
| init.nohead | dont render thead | Boolean | false | true |
| init.nodiv | dont render div | Boolean | false | true |
| dimensions.row | height of each row | Integer,String | null | 10, "2em" |
| dimensions.padding | padding of each row | Integer,String | 10 | 10, "1em" |
| dimensions.widths | width of each column | Array:Integer,Array:String | \[\] | \[ 100, "20%", "40px", 10\] |
| dimensions.minwidth | mininum width of table | Array:Integer,Array:String | null | 100, "20%", "40px", 10 |
| features.sortable.key | initial sorting key (enables sortable) | String | null | "color" |
| features.sortable.direction | ascending or descending | Boolean | false | true |
| features.checkable | blank object (enables checkable) | Object | null | {} |
| features.rearrangeable | callback (enables rearrangeable) | Function | null | (a,b) => alert(\`from ${a} to ${b}\`) |
| features.autohide.container | DOM element (enables autohide) | Element | null | bind:this={domElement},window |
| features.autohide.position | current scroll position (set externally) | Integer | 0 | on:scroll=>{setPosition} |
| features.autohide.buffer | extend area (multiple of container height) | Float | 0 | 2 |
| callbacks.render.key|cell | rendering callback or SvelteComponent | Function,SvelteComponent | o => o.value | o => 'hello world' |
| callbacks.click.key|cell | cell or key click callback | Function | null | o => alert(\`${o.id} clicked!\`) |
| id | id attribute of table | String | table | table-1 |
| class | class attribute of table | String |  | table |
| id | style attribute of table | String |  | background:red |
| debug | debugging console log | Boolean | false | true |
