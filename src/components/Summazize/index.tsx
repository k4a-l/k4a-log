import { getSearchPath, toDateParamString } from "@/app/search/util";
import { NextLink } from "@/components/Link/NextLink";
import { getVaultObject } from "@/features/file/io";
import { Link } from "@/park-ui/components/link";
import { strictEntries } from "@/utils/object";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";

export const SummarizeByYM = async () => {
	// metadataの取得
	const vaultObject = await getVaultObject();

	return (
		<Stack>
			<span
				className={css({
					fontWeight: "bold",
				})}
			>
				月別アーカイブ
			</span>
			<ul
				className={css({
					m: 0,
					pl: 4,
				})}
			>
				{strictEntries(vaultObject.createdMap).map(([yKey, mValue]) => {
					const year = typeof yKey === "number" ? yKey : Number.parseInt(yKey);
					return (
						<Stack key={yKey} gap={0}>
							<li>
								<Link asChild>
									<NextLink
										href={getSearchPath({
											created: toDateParamString({ year: year }),
										})}
									>
										{year}年(
										{strictEntries(mValue).reduce((acc, v) => acc + v[1], 0)})
									</NextLink>
								</Link>
							</li>
							<ul>
								{strictEntries(mValue).map(([mKey, count]) => {
									const month =
										typeof mKey === "number" ? mKey : Number.parseInt(mKey);
									return (
										<li key={month}>
											<Link asChild>
												<NextLink
													href={getSearchPath({
														created: toDateParamString({ year: year, month }),
													})}
												>
													{month}月({count})
												</NextLink>
											</Link>
										</li>
									);
								})}
							</ul>
						</Stack>
					);
				})}
			</ul>
		</Stack>
	);
};
