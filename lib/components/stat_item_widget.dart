import 'package:flutter/material.dart';
import '../flutter_flow/flutter_flow_theme.dart';

class StatItemWidget extends StatelessWidget {
  final String label;
  final String value;

  const StatItemWidget({
    required this.label,
    required this.value,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: FlutterFlowTheme.of(context).titleMedium.copyWith(
            color: FlutterFlowTheme.of(context).primary,
          ),
        ),
        SizedBox(height: 4),
        Text(
          label,
          style: FlutterFlowTheme.of(context).labelSmall,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
