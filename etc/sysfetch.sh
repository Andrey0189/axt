#!/bin/sh

host="$(hostname)"
os="$(awk -F= '/^PRETTY_NAME=/{gsub(/"/,"",$2); print $2}' /etc/os-release)"
kernel="$(uname -r)"
uptime="$(uptime | awk -F, '{sub(".*up ",x,$1);print $1}' | sed -e 's/^[ \t]*//')"
packages="$(pacman -Q | wc -l)"
mem="$(free --mega | awk '/Mem:/ { printf("%5sMB / %sMB\n", $3, $2) }')"

if [[ $packages -eq 0 ]]; then
  packages=$(dpkg-query -f '${binary:Package}\n' -W | wc -l)
fi

parse_rcs() {
	for f in "${@}"; do
		wm="$(tail -n 1 "${f}" 2> /dev/null | cut -d ' ' -f 2)"
		[ -n "${wm}" ] && echo "${wm}" && return
	done
}

ui="$(parse_rcs "${HOME}/.xinitrc" "${HOME}/.xsession")"

if [ -z $ui ]; then
  ui="tty"
fi

cat <<EOF

[┇][        /\\        ] = [${USER}@${host}][\]
[┇][       /  \\       ] = <OS:      ${os}>
[┇][      /\`'.,\\      ] = <KERNEL:  ${kernel}>
[┇][     /     ',     ] = <UPTIME:  ${uptime}>
[┇][    /      ,\`\\    ] = <PCKGS:   ${packages}>
[┇][   /   ,.'\`.  \\   ] = <RAM:   ${mem}>
[┇][  /.,'\`     \`'.\\  ] = <WM:      ${ui}>

EOF
