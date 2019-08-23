

class DacCache {
    constructor(){
        this.cache = new Map;

    }

    normalise_key(key){
        const [name, data_str] = key.split('?');

        if (!data_str){
            return key;
        }

        const url_parts = data_str.split('&').sort();

        return `${name}?${url_parts.join('&')}`;
    }

    get(dac_id, key){
        key = this.normalise_key(key);
        // console.log(`GET ${key}`);

        if (this.cache.has(dac_id)){
            const dac_cache = this.cache.get(dac_id);
            if (dac_cache && dac_cache.has(key)){
                return dac_cache.get(key);
            }
        }

        return null;
    }

    set(dac_id, key, value=null){
        // console.log(`SET ${key}`);
        key = this.normalise_key(key);
        let dac_cache = this.cache.get(dac_id);

        if (!dac_cache){
            dac_cache = new Map;
        }

        if (value === null){
            dac_cache.delete(key);
        }
        else {
            dac_cache.set(key, value);
        }

        this.cache.set(dac_id, dac_cache);
    }

    removePrefix(dac_id, prefix){
        let dac_cache = this.cache.get(dac_id);
        if (dac_cache){
            Array.from(dac_cache.keys()).forEach((k) => {
                if (k.indexOf(prefix) === 0){
                    dac_cache.delete(k);
                }
            });
            this.cache.set(dac_id, dac_cache);
        }
    }
};

module.exports = DacCache;
