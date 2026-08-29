import numpy as np

from app.derived import isotherm_depth, mld, tchp


def test_isotherm_depth_interpolates_shallowest_crossing():
    depths = np.array([0, 10, 20], dtype="float32")
    profile = np.array([[[25.0]], [[15.0]], [[10.0]]], dtype="float32")
    assert np.isclose(isotherm_depth(profile, depths, 20.0)[0, 0], 5.0)


def test_tchp_is_zero_when_surface_is_cooler_than_26c():
    depths = np.array([0, 10, 20], dtype="float32")
    profile = np.array([[[25.0]], [[20.0]], [[15.0]]], dtype="float32")
    assert tchp(profile, depths)[0, 0] == 0.0


def test_mld_uses_10m_reference_and_preserves_no_crossing_as_nan():
    depths = np.array([0, 10, 20], dtype="float32")
    profile = np.array([[[29.0]], [[28.0]], [[27.9]]], dtype="float32")
    assert np.isnan(mld(profile, depths)[0, 0])

