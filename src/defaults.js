import { sort } from 'fast-sort'

function log( msg ) {
	console.log( `[svelte-tabular-table] ${msg}`)
}

let SORT_TIMESTAMP

export const defaults = {
	hover: o => log(`${o.id} "${o.key}" -> hovered`),
	click: o => log(`${o.id} "${o.key}" -> clicked`),
	dblclick: o => log(`${o.id} "${o.key}" -> double clicked`),
	render: o => o.value,
	checked: o => log(`${o.id} -> ${o.event.target.checked ? 'checked' : 'unchecked'}`),
	sort: (key, direction, source, callback) => {
		let timestamp = (new Date() * 1)
		SORT_TIMESTAMP = timestamp
		let copy = [...source]
		window.requestAnimationFrame( e => {

			if ( timestamp != SORT_TIMESTAMP ) return

			let idx = 0
			copy = sort( copy )[ direction ? 'asc' : 'desc' ]( [
				u => u[key],
				u => u.updated
			])

			return callback( copy )

			const min = 20
			let increase = 1

			function sendCallback() {
				if ( timestamp != SORT_TIMESTAMP ) return
				let neu = []
				for (let i = 0; i < increase; i++ ) {
					if (copy[idx]) neu.push( copy[idx] )
					idx += 1
				}
				if ( idx > min ) increase += 1
				callback( neu )
				if (idx < copy.length) window.requestAnimationFrame( sendCallback )
			}

			if ( timestamp != SORT_TIMESTAMP ) return
			sendCallback()
		})
	},
	dimensions: {
		row: null,
		padding: 10,
		widths: []
	}
}
export const slugify = text => text.toString().toLowerCase()
	.replaceAll(' ', '-')           // Replace spaces with -
	.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
