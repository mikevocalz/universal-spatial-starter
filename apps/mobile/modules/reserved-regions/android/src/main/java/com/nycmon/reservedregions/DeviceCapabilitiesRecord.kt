package com.nycmon.reservedregions

import io.github.expo.modules.v2.Record

@Record
data class DeviceCapabilitiesRecord(
  val isFoldable: Boolean,
  val isTablet: Boolean,
  val isHeadset: Boolean,
)
