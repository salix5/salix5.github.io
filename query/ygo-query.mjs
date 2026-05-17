import { card_types, monster_types } from './ygo-constant.mjs';
import { lang } from './ygo-json-loader.mjs';

/**
 * @typedef {Object} CardText
 * @property {string} desc
 * @property {string} [db_desc]
 */

/**
 * @typedef {object} Card
 * @property {number} id
 * @property {number} [cid]
 * @property {number} [rule_code]
 * @property {string} tw_name
 * @property {string} [ae_name]
 * @property {string} [en_name]
 * @property {string} [jp_name]
 * @property {string} [jp_ruby]
 * @property {string} [kr_name]
 * @property {string} [md_name_en]
 * @property {string} [md_name_jp]
 * 
 * @property {number} ot
 * @property {number[]} setcode
 * @property {number} type
 * @property {number} atk
 * @property {number} [def]
 * @property {number} [marker]
 * @property {number} level
 * @property {bigint} race
 * @property {number} attribute
 * @property {number} [scale]
 * @property {string} [md_rarity]
 * @property {CardText} text
 * 
 * @property {number} artid
 * @property {number} color - Card color for sorting
 * @property {number} [pack_index]
 */

/**
 * Print the ATK or DEF of a card.
 * @param {number} x 
 * @returns {string}
 */
export function print_ad(x) {
	if (x === -2)
		return '?';
	else
		return `${x}`;
}

/**
 * Print the card data (without Link Marker).
 * @param {Card} card
 * @returns {string[]} data lines
 */
export function print_data(card) {
	const strings = lang['zh-tw'];
	const result = [];
	if (card.type & card_types.TYPE_MONSTER) {
		const mtype = strings.type_name[card_types.TYPE_MONSTER];
		let subtype = '';
		let lvstr = '\u2605';
		if (card.type & monster_types.TYPE_RITUAL) {
			subtype = `/${strings.type_name[monster_types.TYPE_RITUAL]}`;
		}
		else if (card.type & monster_types.TYPE_FUSION) {
			subtype = `/${strings.type_name[monster_types.TYPE_FUSION]}`;
		}
		else if (card.type & monster_types.TYPE_SYNCHRO) {
			subtype = `/${strings.type_name[monster_types.TYPE_SYNCHRO]}`;
		}
		else if (card.type & monster_types.TYPE_XYZ) {
			subtype = `/${strings.type_name[monster_types.TYPE_XYZ]}`;
			lvstr = `\u2606`;
		}
		else if (card.type & monster_types.TYPE_LINK) {
			subtype = `/${strings.type_name[monster_types.TYPE_LINK]}`;
			lvstr = `LINK-`;
		}
		else if (card.type & monster_types.TYPE_SPSUMMON) {
			subtype = `/${strings.type_name[monster_types.TYPE_SPSUMMON]}`;
		}
		if (card.type & monster_types.TYPE_PENDULUM) {
			subtype += `/${strings.type_name[monster_types.TYPE_PENDULUM]}`;
		}

		// extype
		if (card.type & monster_types.TYPE_NORMAL)
			subtype += `/${strings.type_name[monster_types.TYPE_NORMAL]}`;
		if (card.type & monster_types.TYPE_SPIRIT)
			subtype += `/${strings.type_name[monster_types.TYPE_SPIRIT]}`;
		if (card.type & monster_types.TYPE_UNION)
			subtype += `/${strings.type_name[monster_types.TYPE_UNION]}`;
		if (card.type & monster_types.TYPE_DUAL)
			subtype += `/${strings.type_name[monster_types.TYPE_DUAL]}`;
		if (card.type & monster_types.TYPE_TUNER)
			subtype += `/${strings.type_name[monster_types.TYPE_TUNER]}`;
		if (card.type & monster_types.TYPE_FLIP)
			subtype += `/${strings.type_name[monster_types.TYPE_FLIP]}`;
		if (card.type & monster_types.TYPE_TOON)
			subtype += `/${strings.type_name[monster_types.TYPE_TOON]}`;
		if (card.type & monster_types.TYPE_EFFECT)
			subtype += `/${strings.type_name[monster_types.TYPE_EFFECT]}`;
		result.push(`[${mtype}${subtype}]`);

		const level = `${lvstr}${card.level || '?'}`;
		const attribute = `/${strings.attribute_name[card.attribute] ?? 'null'}`;
		const race = `/${strings.race_name[card.race] ?? 'null'}`;
		result.push(`${level}${attribute}${race}`);

		const attack = `${strings.value_name['atk']}${print_ad(card.atk)}`;
		const defense = !(card.type & monster_types.TYPE_LINK) ? `/${strings.value_name['def']}${print_ad(card.def)}` : '';
		result.push(`${attack}${defense}`);

		if (card.type & monster_types.TYPE_PENDULUM) {
			const scale_left = '🔹';
			const scale_right = '🔸';
			result.push(`${scale_left}${card.scale}/${card.scale}${scale_right}`);
		}
	}
	else if (card.type & card_types.TYPE_SPELL) {
		const extype = card.type & ~card_types.TYPE_SPELL;
		const mtype = `${strings.type_name[card_types.TYPE_SPELL]}`;
		const subtype = `/${strings.type_name[extype] ?? '???'}`;
		result.push(`[${mtype}${subtype}]`);
	}
	else if (card.type & card_types.TYPE_TRAP) {
		const extype = card.type & ~card_types.TYPE_TRAP;
		const mtype = `${strings.type_name[card_types.TYPE_TRAP]}`;
		const subtype = `/${strings.type_name[extype] ?? '???'}`;
		result.push(`[${mtype}${subtype}]`);
	}
	return result;
}
