<script>

	import { defaults, slugify } from './defaults.js'

	export let init
	export let dimensions
	export let callbacks
	export let features

	export let misc

	export let id
	export let item
	export let key
	export let rowIndex
	export let cellIndex
	export let type
	export let colspan = 1


	let class_ = ''
	export { class_ as class }

	$: width = cellIndex == -1 ? 100 : ( dimensions.widths || [] )[ cellIndex ]


	$: _style = e => {

		let s = `
			overflow-wrap:break-word;
			box-sizing:content-box;
			display: flex;
			align-items: center;`
			
		const rowDefined = dimensions.row != undefined
		const paddDefined = dimensions.padding != undefined

		const whitespace = 'white-space: nowrap;overflow:hidden;text-overflow: ellipsis;'
		const em = rowDefined ? dimensions.row + 'px;' : 'auto;'
		if (paddDefined) s += 'padding:' + dimensions.padding + 'px;'
		s += features.autohide || rowDefined ? whitespace + 'height:' + em  + 'line-height:' + em : '' 
		return s
	}
	$: style = _style()

	$: tdStyle = `
		vertical-align:middle;
		margin:0;
		padding:0;
		${ sticky ? 'position:sticky;top:0;' : 'position:relative;' }
		${ sorting && type =='key' ? 'cursor:pointer' : ''}
		${width?`width:${ isNaN(width) ? width : width + 'px' };`:''}`

	$: hasSlot = $$props.$$slots

	$: sticky = init.sticky && type == 'key'
	$: obj = { id, item, key, value: item[key], cellIndex, rowIndex, type }
	$: cbs = callbacks || {}
	$: renderFunc = (cbs.render || {})[type] || defaults.render
	$: clickFunc = (cbs.click || {})[type] || defaults.click
	$: dblClickFunc = (cbs.dblclick || {})[type] || defaults.dblclick

	let clickCount = 0

	function onClick(obj, e) {

		clickCount += 1
		setTimeout(() => {
			if (clickCount === 1) clickFunc( { ...obj, event: e } )
			else if (clickCount === 2) dblClickFunc( { ...obj, event: e } )

			clickCount = 0
		}, 0);
		
		const exists = init.keys.indexOf( key ) != -1
		if ( type == 'key' && exists && sorting ) {
			misc.reorder( { id, item, key, e} )
		}
	}
	$: sorting = features?.sortable?.key
	$: direction = features?.sortable?.direction
	$: same = sorting == key
	$: render = component ? null : (renderFunc( obj ) || '')
	$: component = Object.getOwnPropertyNames(renderFunc).indexOf('prototype') != -1

	function getRender( obj ) {
		return component ? null : (renderFunc( obj ) || '')
	}
</script>


<!-- not the best solution for TD/TH, but will have to do -->

{#if type == 'key'}

	<th style={tdStyle}
		{colspan}
		width={width || undefined}
		class={ class_ + ' stt-'+slugify( key ) }
		class:stt-sticky={sticky}
		class:stt-sorted={ same }
		class:stt-ascending={ same && direction }
		class:stt-descending={ same && !direction }
		data-key={ key }
		on:click={ e => onClick(obj, e) }>
		{#if init.nodiv}
			{#if !$$slots.default }
				{#if component } <svelte:component this={renderFunc} {...obj} />
				{:else} {obj.key} {/if}
			{:else}
				<slot />
			{/if}
		{:else}
			<div 
				class:chevron={ same && type == 'key'  }
				{style}>
				{#if !$$slots.default }
					{#if component } <svelte:component this={renderFunc} {...obj} />
					{:else} {obj.key} {/if}
				{:else}
					<slot />
				{/if}
			</div>
		{/if}
	</th>

{:else}

	<td style={tdStyle}
		{colspan}
		width={width || undefined}
		class={ class_ + ' stt-'+slugify( key ) }
		class:stt-sticky={sticky}
		class:stt-sorted={ same }
		class:stt-ascending={ same && direction }
		class:stt-descending={ same && !direction }
		data-key={ key }
		on:click={ e => onClick(obj, e) }>
		{#if init.nodiv}
			{#if !$$slots.default }
				{#if component } <svelte:component this={renderFunc} {...obj} />
				{:else} {@html render} {/if}
			{:else}
				<slot />
			{/if}
		{:else}
			<div 
				class:chevron={ same && type == 'key'  }
				{style}>
				{#if !$$slots.default }
					{#if component } <svelte:component this={renderFunc} {...obj} />
					{:else} {@html render}{/if}
				{:else}
					<slot />
				{/if}
			</div>
		{/if}
	</td>

{/if}
