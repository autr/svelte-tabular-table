<script>
	import Tr from './Tr.svelte'
	import { onMount, onDestroy } from 'svelte'
	import dragdrop from 'svelte-native-drag-drop'
	import { defaults, slugify } from './defaults.js'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher();

	function warn( msg ) {
		console.warn( `[svelte-tabular-table] ${msg}`)
	}
	function log( msg ) {
		if (debug) console.log( `[svelte-tabular-table] ${msg} ${ id ? '("' + id + '")' : ''}`)
	}
	function error( msg ) {
		console.error( `[svelte-tabular-table] ${msg}`)
	}

	function review( init_, dimensions, callbacks, features, misc ) {

		if ( features.autohide && !dimensions.row ) warn( 'features.autohide is set, but no height is set for dimensions.row (defaulting to 1em)')

		let ids = []

		let tally = { added: 0, duped: 0 }
		const len = init.data.length
		for (let i = 0; i < len; i++ ) {
			if (!init.data[i][init.index]) {
				const id = 'id' + i
				// warn(`no property "${init.index}" in data item ${i}, defaulting to "${id}"`)
				init.data[i][init.index] = id
				tally.added += 1
			}
			if ( ids.indexOf( init.data[i][init.index] ) != -1 ) {
				init.data[i] = {...init.data[i]}
				while ( ids.indexOf( init.data[i][init.index] ) != -1 ) init.data[i][init.index] += '_dup'
				tally.duped += 1
			}
			ids.push( init.data[i][init.index] )
		}
		const activ = tally.duped > 0 || tally.added > 0
		if (activ ) warn( `${init_?.name || ''} ${tally.duped}/${len} duplicate keys amended, ${tally.added}/${len} keys added`)

		if ( !features.autohide ) {
			misc.inited = true
			dispatch('inited')
		}

	}

  export let debug = false
	$: if (debug) {
		review( init, dimensions, callbacks, features, misc )
	}

	let class_ = ''
	export { class_ as class }
	let style_ = ''
	export { style_ as style }

	export let init = {
		name: 'table',
		keys: [], // array of text or array of objects
		data: [],
		index: null,
		nohead: false,
		nodiv: false
	}

	export let dimensions = {...defaults.dimensions}
	export let id = 'table'

	onMount( async () => {

	})

	export let classes = {}

	export let callbacks = {

		click: {
			key: defaults.click,
			row: defaults.click,
			cell: defaults.click
		},
		render: {
			key: defaults.render,
			cell: defaults.render
		},
		checked: defaults.checked,
		sort: defaults.sort
	}

	export let features = {
		sortable: { 
			key: null, 
			direction: false
		}, 
		rearrangeable: null, // <- callback event for rearranging with integer index (from, to) as arguments
		checkable: null,
		autohide: null
	}

	let misc = {
		hidden: {},
		els: { table: null, thead: null, tr: {}, td: {}, handles: {}, drops: {} },
		inited: false,
		reorder: o => {
			const key = features?.sortable?.key
			features.sortable.direction = !features.sortable.direction
			if (o.key) {
				const d = features.sortable.direction
				features.sortable.key = o.key
				log( `sorting with "${o.key}" -> ${ d ? 'ascending' : 'descending'}`)
			}
		}
	}

	let hasDragDrop = false
	let isDestroying = false

	onDestroy( async () => { 
		if ( hasDragDrop ) dragdrop.clear('table')
		isDestroying = true
	})


	function bindDragDrop( data ) {

		if (!features.rearrangeable) return

		setTimeout( () => {

			if ( hasDragDrop ) dragdrop.clear('table')
			for (const [key, tr] of Object.entries( misc.els.tr )) {

				const handle = misc.els.handles[key]

				const callbacks = {
					drop: e => {
						try {
							const f = e.source.getAttribute('data-key')
							const t = e.destination.getAttribute('data-key')
							const ff = init.data.find( d => d[init.index] == f )
							const tt = init.data.find( d => d[init.index] == t )
							const fff = init.data.indexOf(ff)
							const ttt = init.data.indexOf(tt)
							log(`dragged from ${fff} to ${ttt}`)
							if ( typeof(features.rearrangeable) == 'function' ) {
								features.rearrangeable( fff, ttt )
							} else {
								warn(`there is no callback for features.rearrangeable (nothing will happen)`)
							}
						} catch( err ) {
							error(`could not drag and drop: ${err.message}`)
						}
					},
					enable: e => isDragging = true,
					disable: e => isDragging = false
				}
				if (handle && tr) {
					dragdrop.addDragArea( 'table', handle, tr )
					dragdrop.addDropArea( 'table', tr, callbacks )
					hasDragDrop = true
				}
			}
		}, 1)
	}


	let aboveY, belowY, bottomY



	function onScroll( init_, autohide, dims ) {

		if (!autohide) return

		if (autohide && dimensions?.row == undefined) dimensions.row = defaults.dimensions.row
		if (autohide && dimensions?.padding == undefined) dimensions.padding = defaults.dimensions.padding


		let tally = { above: 0, below: 0, first: null, last: null }
		const len = (data || []).length
		const el = autohide?.container
		const exists = el != undefined && len > 0
		const scroll = autohide?.position || 0
		const height = dims.row + (dims.padding * 2)
		const outside = ( el?.offsetHeight || window.innerHeight ) + height
		const extra = outside * ( autohide?.buffer || 0 )



		const to = misc?.els?.table?.offsetTop || 0
		const eo = el?.offsetTop || 0
		const off = to - eo

		for (let i = 0; i < len; i++ ) {

			const item = data[i]
			const id = item[ init.index ]

			misc.hidden[ id ] = false

			const thead = init.nohead ? 0 : height
			const piece = (height * i) + height + thead

			const above = scroll > piece + off + extra
			const below = piece + off > scroll + outside + extra

			if ( ( above || below  ) && exists ) misc.hidden[id] = true

			if ( above ) {
				tally.above += 1
				tally.first = i
			}
			if ( below ) {
				tally.below += 1
				if (!tally.last) tally.last = i
			}

		}

		const activ = tally.above > 0 || tally.below > 0

		const indicators = false

		if (debug && activ && indicators) {
			if (!aboveY) {
				aboveY = document.createElement('div')
				document.body.appendChild( aboveY ) 
				belowY = document.createElement('div')
				document.body.appendChild( belowY ) 
				bottomY = document.createElement('div')
				document.body.appendChild( bottomY ) 
			}
			const all = `
				position: absolute;
				width: 100vw;
				height: 1px;
				background: red;
				display: block;
				left: 0px;`
			aboveY.style = `
				${all}
				top: ${ eo - scroll }px;`
			belowY.style = `
				${all}
				top: ${ to - scroll }px;`
			bottomY.style = `
				${all}
				top: ${ to - scroll + (misc?.els?.table?.offsetHeight || 0) }px;`
		}

		if (exists && debug) {
			log(`${outside}px container: ${tally.above}/${len} above, ${tally.below}/${len} below, from ${tally.first} to ${tally.last}, ${len - (tally.above+tally.below)}/${len} visible, using height ${height}px`)
		}

		if (exists) {
			misc.inited = true
			dispatch('inited')
		}
	}

	const triggerScroll = e => onScroll( init, features?.autohide, dimensions )

	$: onScroll( init, features?.autohide, dimensions )
	$: bindDragDrop( init.data )

	function _thead() {
	
		return init.keys.reduce(function(result, item, index) {
				result[item] = item
				return result
		}, { [ init.index ]: 'svelte-tabular-table-thead' })
	}

	$: thead = _thead()

	let indeterminate = false

	function isIndeterminate( checkable ) {
		let yes = false
		let no = false
		for (let i = 0; i < init.data.length; i++) {
			const id = init.data[i][init.index]
			if ( (features.checkable || [])[id] ) yes = true
			if ( !(features.checkable || [])[id] ) no = true
		}
		if ( !yes && no ) return indeterminate = false
		if ( yes && !no ) return indeterminate = false
		return indeterminate = true

	}


	$: isIndeterminate( features.checkable )


	let data = []

	let previousSortEvent
	$: ( (_key, _direction) => {
		const sortEvent = _key + _direction + init.data.length
		if (sortEvent == previousSortEvent) return
		previousSortEvent = sortEvent
		if (_key) {
			const fn = (callbacks?.sort || defaults.sort)
			data = []
			fn( 
				features.sortable.key, 
				features.sortable.direction, 
				init.data, 
				( neue => {
					if (isDestroying) return
					data = data.concat( neue )
				})
			)
			setTimeout( triggerScroll, 1 )
		} else {
			data = init.data
		}
	})( features?.sortable?.key, features?.sortable?.direction )

	$: tableLayout = dimensions.widths ? 'table-layout:fixed;' : ''
	$: allStyles = `min-width:${dimensions.minwidth || '0'}px;width:100%;${tableLayout}border-spacing:0;${style_}`

</script>
<table 
	bind:this={ misc.els.table } 
	id={ 'stt-'+slugify(id) }
	class={ class_ + ' stt-'+slugify(id) }
	data-id={ slugify(id) }
	style={ allStyles }>

	{#if !init.nohead}
		<thead>

			<Tr {init} {dimensions} {debug} {callbacks} bind:features={features} {misc} item={thead} type={'key'} {indeterminate} rowIndex={-1} />
		</thead>

	{/if}

	<tbody >
		{#each data as item, idx }
			<Tr {init} {classes} {dimensions} {debug} {callbacks} bind:features={features} {misc} {item} rowIndex={idx} type={'cell'} />

		{/each}
	</tbody>
</table>
