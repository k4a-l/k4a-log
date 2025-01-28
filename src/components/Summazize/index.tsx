import { getSearchPath, toDateParamString } from "@/app/search/util";
import { NextLink } from "@/components/Link/NextLink";
import { getVaultObject } from "@/features/file/io";
import { Link } from "@/park-ui/components/link";
import { IS_PRODUCTION } from "@/utils/env";
import { strictEntries } from "@/utils/object";
import { isTestDirPath } from "@/utils/path";
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
							(acc: number, v) =>
								acc +
								v[1].filter((p) => !(IS_PRODUCTION && isTestDirPath(p))).length,
							0,
						);

						if (!yearCount) return;

						return (
							<Stack key={yKey} gap={0} pb={2}>
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
								<HStack>
									{strictEntries(mValue).map(([mKey, paths], i) => {
										const month =
											typeof mKey === "number" ? mKey : Number.parseInt(mKey);

										const monthCount = paths.filter(
											(p) => !(IS_PRODUCTION && isTestDirPath(p)),
										).length;

										if (!monthCount) return;

										return (
											<span key={month}>
												<Link asChild>
													<NextLink
														href={getSearchPath({
															created: toDateParamString({ year: year, month }),
														})}
													>
														{month}月(
														{monthCount})
													</NextLink>
												</Link>
												{i !== strictEntries(mValue).length - 1 && ","}
											</span>
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
