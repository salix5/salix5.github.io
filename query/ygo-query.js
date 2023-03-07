"use strict";
// JSON
const cid_table = Object.create(null);
const name_table = Object.create(null);
const name_table_en = Object.create(null);
const pack_list = Object.create(null);
const setname = Object.create(null);
const ltable = Object.create(null);
const ltable_md = Object.create(null);
const promise_lflist2 = fetch("text/lflist_md.json").then(response => response.json()).then(data => Object.assign(ltable_md, data));

var promise_text = null;
if (localStorage.getItem("last_pack") === last_pack) {
	Object.assign(cid_table, JSON.parse(localStorage.getItem("cid_table")));
	Object.assign(name_table, JSON.parse(localStorage.getItem("name_table")));
	Object.assign(name_table_en, JSON.parse(localStorage.getItem("name_table_en")));
	Object.assign(pack_list, JSON.parse(localStorage.getItem("pack_list")));
	Object.assign(setname, JSON.parse(localStorage.getItem("setname")));
	Object.assign(ltable, JSON.parse(localStorage.getItem("ltable")));
	promise_text = Promise.resolve(true);
}
else {
	localStorage.clear();
	const promise_cid = fetch("text/cid.json").then(response => response.json()).then(data => Object.assign(cid_table, data));
	const promise_name = fetch("text/name_table.json").then(response => response.json()).then(data => Object.assign(name_table, data));
	const promise_name_en = fetch("text/name_table_en.json").then(response => response.json()).then(data => Object.assign(name_table_en, data));
	const promise_pack = fetch("text/pack_list.json").then(response => response.json()).then(data => Object.assign(pack_list, data));
	const promise_setname = fetch("text/setname.json").then(response => response.json()).then(data => Object.assign(setname, data));
	const promise_lflist = fetch("text/lflist.json").then(response => response.json()).then(data => Object.assign(ltable, data));
	promise_text = Promise.all([promise_cid, promise_name, promise_name_en, promise_pack, promise_setname, promise_lflist]).then(function () {
		try {
			localStorage.setItem("cid_table", JSON.stringify(cid_table));
			localStorage.setItem("name_table", JSON.stringify(name_table));
			localStorage.setItem("name_table_en", JSON.stringify(name_table_en));
			localStorage.setItem("pack_list", JSON.stringify(pack_list));
			localStorage.setItem("setname", JSON.stringify(setname));
			localStorage.setItem("ltable", JSON.stringify(ltable));
			localStorage.setItem("last_pack", last_pack);
		} catch (ex) {
		}
	});
}

// sqlite
const extra_url = "../cdb/pre-release.cdb";
const promise_db = fetch("https://salix5.github.io/CardEditor/cards.zip").then(response => response.blob()).then(JSZip.loadAsync).then(zip_file => zip_file.files["cards.cdb"].async("uint8array"));
const promise_db2 = fetch(extra_url).then(response => response.arrayBuffer()).then(buf => new Uint8Array(buf));
const config = {
	locateFile: filename => `./dist/${filename}`
};

var SQL;
var db, db2;

Promise.all([initSqlJs(config), promise_db, promise_db2, promise_lflist2, promise_text]).then(function (values) {
	SQL = values[0];
	db = new SQL.Database(values[1]);
	db2 = new SQL.Database(values[2]);
	url_query();
	button1.disabled = false;
	button2.disabled = false;
});

const default_query1 = `SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND NOT type & ${TYPE_TOKEN}`;
const default_query2 = `SELECT datas.id FROM datas, texts WHERE datas.id == texts.id AND alias == 0 AND NOT type & ${TYPE_TOKEN}`;

// print condition for cards in pack
function pack_cmd(pack) {
	let cmd = '';
	cmd = ` AND (0`;
	for (let i = 0; i < pack.length; ++i) {
		if (pack[i] !== 0 && pack[i] !== 1)
			cmd += ` OR datas.id=${pack[i]}`;
	}
	cmd += `)`;
	return cmd;
}

// check if card is alternative art
function is_alternative(card) {
	if (card.type & TYPE_TOKEN)
		return card.alias !== 0;
	else
		return Math.abs(card.id - card.alias) < 10;
}

/*
 * query cards in db and push into ret
 * qstr: sqlite command
 * arg: bindind object
*/
function query_card(db, qstr, arg, ret) {
    let stmt = db.prepare(qstr);
    stmt.bind(arg);

	// pack_id
    let inv_pack = Object.create(null);
    if (arg.pack && pack_list[arg.pack]) {
        for (let i = 0; i < pack_list[arg.pack].length; ++i) {
            if (pack_list[arg.pack][i] !== 0 && pack_list[arg.pack][i] !== 1)
                inv_pack[pack_list[arg.pack][i]] = i;
        }
    }

    while (stmt.step()) {
        let card = stmt.getAsObject();

        // spell & trap reset data
        if (card.type & (TYPE_SPELL | TYPE_TRAP)) {
            card.atk = 0;
            card.def = 0;
            card.level = 0;
            card.race = 0;
            card.attribute = 0;
        }
        card.scale = (card.level >> 24) & 0xff;
        card.level = card.level & 0xff;

        // color
        if (card.type & TYPE_MONSTER) {
            if (!(card.type & TYPE_EXT)) {
                if (card.type & TYPE_TOKEN)
                    card.color = 0;
                else if (card.type & TYPE_NORMAL)
                    card.color = 1;
                else if (card.type & TYPE_RITUAL)
                    card.color = 3;
                else if (card.type & TYPE_EFFECT)
                    card.color = 2;

                else
                    card.color = null;
            }
            else {
                if (card.type & TYPE_FUSION)
                    card.color = 4;
                else if (card.type & TYPE_SYNCHRO)
                    card.color = 5;
                else if (card.type & TYPE_XYZ)
                    card.color = 6;
                else if (card.type & TYPE_LINK)
                    card.color = 7;

                else
                    card.color = null;
            }
        }
        else if (card.type & TYPE_SPELL) {
            if (card.type === TYPE_SPELL)
                card.color = 10;
            else if (card.type & TYPE_QUICKPLAY)
                card.color = 11;
            else if (card.type & TYPE_CONTINUOUS)
                card.color = 12;
            else if (card.type & TYPE_EQUIP)
                card.color = 13;
            else if (card.type & TYPE_RITUAL)
                card.color = 14;
            else if (card.type & TYPE_FIELD)
                card.color = 15;

            else
                card.color = null;
        }
        else if (card.type & TYPE_TRAP) {
            if (card.type === TYPE_TRAP)
                card.color = 20;
            else if (card.type & TYPE_CONTINUOUS)
                card.color = 21;
            else if (card.type & TYPE_COUNTER)
                card.color = 22;

            else
                card.color = null;
        }
        else {
            card.color = null;
        }

        // cid
        card.cid = cid_table[card.id] ? cid_table[card.id] : null;
        card.jp_name = name_table[card.id] ? name_table[card.id] : null;
        card.en_name = name_table_en[card.id] ? name_table_en[card.id] : null;

        // pack_id
        if (card.id <= 99999999) {
            if (arg.pack && pack_list[arg.pack])
                card.pack_id = inv_pack[card.id];

            else
                card.pack_id = null;
        }
        else {
            card.pack_id = card.id % 1000;
        }
        ret.push(card);
    }
    stmt.free();
}

// query cards in main db and pre-release db
function query(qstr, arg, ret) {
	ret.length = 0;
	query_card(db, qstr, arg, ret);
	query_card(db2, qstr, arg, ret);
}
