import path from "node:path";
import { postDirPath } from "@/constants/path";
import { blogDirPath } from "@/features/metadata/constant";
import { strictEntries, strictFromEntries } from "@/utils/object";
import { normalizePath } from "@/utils/path";
import { redirect } from "next/navigation";
import NotFound from "../notFound";

const oldBlogDirPaths = [
	"20190000_happybirthday",
	"20190001_no_leaflets",
	"20190004_drinking_party_is_to_dull",
	"20190130_hhkb_first_impression",
	"20190218_practice_typing",
	"20201209_hhkb",
	"20201211_hitbtc_kyc",
	"20210128_twitterdelete",
	"20210223_ipadmini5_to_ipadair4",
	"20210226_keyswitch_structure",
	"20210306_hhkb_goodpoints",
	"20210321_AppleSupport",
	"20210325_my_ymobile_linemo",
	"20210326_10selections",
	"20210406_airpods_alert",
	"20210419_a_cup_of_rice",
	"20210420_tbc_trial",
	"20210421_ymobile_chat",
	"20210424_delete_internet_archive",
	"20211219_turing_spam",
	"20220324_log_site_migration",
	"20220409_oppo_rotation_suggestions",
	"20220424_react_recoil_storybook",
	"20220424_storybook_typescript",
	"20220614_introducing_writing",
	"20220615_place_to_dump",
	"20220616_rails_of_life",
	"20220617_three_way_logs",
	"20220624_android12_overscroll",
];

const redirectMap: { [key: string]: string } = strictFromEntries(
	strictEntries({
		// 過去のブログ
		...strictFromEntries(
			oldBlogDirPaths.map((p) => [p, path.join(postDirPath, blogDirPath, p)]),
		),
	} satisfies { [key: string]: string }).map(([k, v]) => [
		normalizePath(k.toString()),
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
