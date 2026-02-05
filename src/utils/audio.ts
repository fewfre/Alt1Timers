// type FileSoundArgs = { sound: string, repeat: boolean };
// type VoiceArgs = { speed: number, text: string, pitch: number };
// type SoundArgs = FileSoundArgs | VoiceArgs;
export type SoundMeta = { name: string, src: string, normvolume: number };
// export type SoundMetaCustom = SoundMeta & { uploadid: string };

// function isFileSound(s: SoundArgs): s is FileSoundArgs {
// 	return typeof (s as FileSoundArgs).sound != "undefined";
// }
// function isVoiceSound(s: SoundArgs): s is VoiceArgs {
// 	return typeof (s as VoiceArgs).text != "undefined";
// }


// Default sounds taken from AfkScape alt1 app
export var presetSounds: { [id: string]: SoundMeta } = {
	bell: { name: "Reception Bell", src: "sounds/bell.wav", normvolume: 1 },
	notification1: { name: "Notification 1", src: "sounds/notification1.wav", normvolume: 1 },
	notification2: { name: "Notification 2", src: "sounds/notification2.wav", normvolume: 1 },
	notification3: { name: "Notification 3", src: "sounds/notification3.wav", normvolume: 1 },
	elevator: { name: "Elevator", src: "sounds/elevator.wav", normvolume: 1 },
	alarm: { name: "Generic Alarm", src: "sounds/alarm2.wav", normvolume: 1 },
	oilrig: { name: "Oil Rig", src: "sounds/oilrig.ogg", normvolume: 1 },
	// nuclear: { name: "Nuclear Meltdown", src: "sounds/nuclear.wav", normvolume: 1 },
};

// export namespace customSounds {
// 	export var cache: string[] = [];
// 	export var addSound = function (id: string) {
// 		if (cache.indexOf(id) == -1) {
// 			cache.push(id);
// 		}
// 	}
// }

// var sounds: { src: string, audio: HTMLAudioElement }[] = [];
// var store = function (audio: HTMLAudioElement, src: string) {
// 	console.log("soundcache stored: " + src);
// 	sounds.push({ audio: audio, src: src });
// }
// export function getSoundMeta(id: string) {
// 	if (!id) { return null; }
// 	var prefixmatch = id.match(/^upload:(\w{3,6}):(.*)$/);
// 	if (prefixmatch) { return { name: "Custom: " + prefixmatch[2], src: "/i/" + prefixmatch[1] + ".mp3", normvolume: 1, uploadid: id } as SoundMetaCustom; }
// 	if (id.match(/\w+/) && presetSounds[id]) { return presetSounds[id]; }
// 	return null;
// }

interface AudioPlayProps {
	volume?: number;
	repeat?: boolean;
}
export class AudioPlayer {
	static globalMute = false;
	static globalVolumeMulti = 0.5;
	
	playing = false;
	audio: HTMLAudioElement | null = null;

	play(pAudio:HTMLAudioElement, { volume=1, repeat=false }: AudioPlayProps={}) {
		if (!pAudio || this.playing) { return; }
		this.audio = pAudio;
		this.audio.volume = AudioPlayer.globalMute ? 0 : Math.min(volume * AudioPlayer.globalVolumeMulti, 1);
		this.audio.currentTime = 0;
		this.audio.loop = repeat;
		var p = this.audio.play();
		this.playing = true;
		return p;
	}

	stop() : this {
		this.playing = false;
		if (this.audio) { this.audio.pause(); }
		return this;
	}
}

export class AudioLoader {
	static loadedAudios: Record<string, { audio:HTMLAudioElement, volume:number }> = {};
	static audioPlayer = new AudioPlayer();
	
	static loadSoundFile(id:string, src:string, volume=1) {
		if(AudioLoader.loadedAudios[id]) { return AudioLoader.loadedAudios[id]; }
		AudioLoader.loadedAudios[id] = { audio:new Audio(src), volume };
		return AudioLoader.loadedAudios[id];
	}
	
	static loadId(id:string) {
		if(AudioLoader.loadedAudios[id]) { return AudioLoader.loadedAudios[id]; }
		if(!presetSounds[id]) return null;
		return AudioLoader.loadSoundFile(id, presetSounds[id].src, presetSounds[id].normvolume);
	}

	static play(id:string, { volume=1, repeat=false }: AudioPlayProps={}) {
		const audioCache = AudioLoader.loadId(id);
		if(!audioCache) {
			console.error("Audio id not found/loaded: "+id);
			return;
		}
		AudioLoader.audioPlayer.stop().play(audioCache.audio, { volume:audioCache.volume*volume, repeat });
	}

	static stop() {
		AudioLoader.audioPlayer.stop();
	}
}