import hashlib
import hmac
import unittest

from main import paise, verify_hmac_sha256


class PaymentHelperTests(unittest.TestCase):
    def test_paise_rounding(self):
        self.assertEqual(paise("125.50"), 12550)
        self.assertEqual(paise("125.556"), 12556)

    def test_valid_hmac_signature(self):
        secret = "test-webhook-secret"
        payload = b'{"event":"payment.captured"}'
        signature = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        self.assertTrue(verify_hmac_sha256(payload, signature, secret))

    def test_invalid_hmac_signature(self):
        payload = b'{"event":"payment.failed"}'
        self.assertFalse(verify_hmac_sha256(payload, "invalid", "test-secret"))


if __name__ == "__main__":
    unittest.main()
