import path from "node:path";
import { strictEntries, strictFromEntries } from "@/utils/object";
import { normalizePath } from "@/utils/path";
import { redirect } from "next/navigation";
import NotFound from "../notFound";

const redirectMap: { [key: string]: string } = strictFromEntries(
	strictEntries({
		// 過去のブログ
		"20190000_happybirthday": "/posts/blog/20190000_happybirthday",
		"20190001_no_leaflets": "/posts/blog/20190001_no_leaflets",
		"20190004_drinking_party_is_to_dull":
			"/posts/blog/20190004_drinking_party_is_to_dull",
		"20190130_hhkb_first_impression":
			"/posts/blog/20190130_hhkb_first_impression",
		"20190218_practice_typing": "/posts/blog/20190218_practice_typing",
		"20201209_hhkb": "/posts/blog/20201209_hhkb",
		"20201211_hitbtc_kyc": "/posts/blog/20201211_hitbtc_kyc",
		"20210128_twitterdelete": "/posts/blog/20210128_twitterdelete",
		"20210223_ipadmini5_to_ipadair4":
			"/posts/blog/20210223_ipadmini5_to_ipadair4",
		"20210226_keyswitch_structure": "/posts/blog/20210226_keyswitch_structure",
		"20210306_hhkb_goodpoints": "/posts/blog/20210306_hhkb_goodpoints",
		"20210321_AppleSupport": "/posts/blog/20210321_AppleSupport",
		"20210325_my_ymobile_linemo": "/posts/blog/20210325_my_ymobile_linemo",
		"20210326_10selections": "/posts/blog/20210326_10selections",
		"20210406_airpods_alert": "/posts/blog/20210406_airpods_alert",
		"20210419_a_cup_of_rice": "/posts/blog/20210419_a_cup_of_rice",
		"20210420_tbc_trial": "/posts/blog/20210420_tbc_trial",
		"20210421_ymobile_chat": "/posts/blog/20210421_ymobile_chat",
		"20210424_delete_internet_archive":
			"/posts/blog/20210424_delete_internet_archive",
		"20211219_turing_spam": "/posts/blog/20211219_turing_spam",
		"20220324_log_site_migration": "/posts/blog/20220324_log_site_migration",
		"20220409_oppo_rotation_suggestions":
			"/posts/blog/20220409_oppo_rotation_suggestions",
		"20220424_react_recoil_storybook":
			"/posts/blog/20220424_react_recoil_storybook",
		"20220424_storybook_typescript":
			"/posts/blog/20220424_storybook_typescript",
		"20220614_introducing_writing": "/posts/blog/20220614_introducing_writing",
		"20220615_place_to_dump": "/posts/blog/20220615_place_to_dump",
		"20220616_rails_of_life": "/posts/blog/20220616_rails_of_life",
		"20220617_three_way_logs": "/posts/blog/20220617_three_way_logs",
		"20220624_android12_overscroll":
			"/posts/blog/20220624_android12_overscroll",
	} satisfies { [key: string]: string }).map(([k, v]) => [
		normalizePath(k),
		normalizePath(v),
	]),
);

type Params = Promise<{ catchAll: string[] | undefined }>;

type Props = { params: Params };

export default async function Any({ params }: Props) {
	const urls = (await params).catchAll ?? [];
	const url = normalizePath(path.join(...urls));

	const redirectTarget = redirectMap[url];

	if (redirectTarget) {
		redirect(redirectTarget);
	}

	return <NotFound />;
}
