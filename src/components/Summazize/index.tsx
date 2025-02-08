import { getSearchPath, toDateParamString } from "@/app/search/util";
import { NextLink } from "@/components/Link/NextLink";
import { getVaultObject } from "@/features/file/io";
import { Link } from "@/park-ui/components/link";
import { strictEntries } from "@/utils/object";
import { css } from "styled-system/css";
import { HStack, Stack } from "styled-system/jsx";

export const SummarizeByYM = async () => {
	// metadataの取得
	const vaultObject = getVaultObject();

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
				{strictEntries(vaultObject.createdMap)
					.sort(([yKeyA], [yKeyB]) => Number(yKeyB) - Number(yKeyA))
					.map(([yKey, mValue]) => {
						const year =
							typeof yKey === "number" ? yKey : Number.parseInt(yKey);

						const yearCount = strictEntries(mValue).reduce(
							(acc: number, v) => acc + v[1].length,
							0,
						);

						if (!yearCount) return;

						return (
							<Stack gap={0} key={yKey} pb={2}>
								<li>
									<Link asChild>
										<NextLink
											href={getSearchPath({
												created: toDateParamString({ year: year }),
											})}
										>
											{year}年({yearCount})
										</NextLink>
									</Link>
								</li>
								<HStack flexWrap={"wrap"} columnGap={1} rowGap={1}>
									{strictEntries(mValue).map(([mKey, paths], i) => {
										const month =
											typeof mKey === "number" ? mKey : Number.parseInt(mKey);

										const monthCount = paths.length;
										if (!monthCount) return;

										return (
											<HStack key={month} gap={0} alignItems={"end"}>
												<Link asChild textWrap={"nowrap"}>
													<NextLink
														href={getSearchPath({
															created: toDateParamString({ year: year, month }),
														})}
													>
														{month}月({monthCount})
													</NextLink>
												</Link>
												{i !== strictEntries(mValue).length - 1 && ","}
											</HStack>
										);
									})}
								</HStack>
							</Stack>
						);
					})}
			</ul>
		</Stack>
	);
};
