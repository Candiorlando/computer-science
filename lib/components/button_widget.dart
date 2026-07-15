import 'package:flutter/material.dart';
import '../flutter_flow/flutter_flow_theme.dart';

class ButtonWidget extends StatelessWidget {
  final String content;
  final String icon;
  final bool icon_present;
  final String icon_end;
  final bool icon_end_present;
  final Color color;
  final Color bg;
  final double height;
  final double radius;
  final String variant;
  final String size;
  final bool full_width;
  final bool loading;
  final bool disabled;

  const ButtonWidget({
    required this.content,
    required this.icon,
    required this.icon_present,
    required this.icon_end,
    required this.icon_end_present,
    required this.color,
    required this.bg,
    required this.height,
    required this.radius,
    required this.variant,
    required this.size,
    required this.full_width,
    required this.loading,
    required this.disabled,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    IconData? iconData;
    if (icon_present) {
      iconData = _getIconData(icon);
    }

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: disabled ? Colors.grey : bg,
        borderRadius: BorderRadius.circular(radius),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: disabled ? null : () {},
          borderRadius: BorderRadius.circular(radius),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon_present && iconData != null)
                  Icon(iconData, color: color, size: 24),
                if (icon_present && iconData != null) SizedBox(width: 8),
                if (loading)
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(color),
                      strokeWidth: 2,
                    ),
                  )
                else
                  Text(
                    content,
                    style: TextStyle(
                      color: color,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData? _getIconData(String iconName) {
    final iconMap = {
      'login_rounded': Icons.login_rounded,
      'logout_rounded': Icons.logout_rounded,
      'arrow_forward_rounded': Icons.arrow_forward_rounded,
    };
    return iconMap[iconName];
  }
}
